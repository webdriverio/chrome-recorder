import { runInNewContext } from 'node:vm'
import { StepType, type WaitForElementStep } from '@puppeteer/replay'
import { expect, it, vi } from 'vitest'
import { InMemoryLineWriter } from './InMemoryLineWriter.js'
import { StringifyExtension } from '../src/stringifyExtension.js'

async function runWait(options: Partial<WaitForElementStep>, polls: object[][]) {
    const step = { type: StepType.WaitForElement as const, selectors: ['#counter'], ...options }
    const writer = new InMemoryLineWriter('  ')
    await new StringifyExtension().stringifyStep(writer, step, { title: 'counter', steps: [step] })
    const selector = vi.fn(() => polls.shift())
    const waitUntil = vi.fn(async (predicate: () => Promise<boolean>) => {
        while (polls.length) {
            if (await predicate()) return true
        }
        return false
    })
    const browser = {
        $$: selector,
        waitUntil,
        execute: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => fn(...args),
    }
    await runInNewContext('(async () => {' + writer.toString() + '})()', { browser })
    return { selector, waitUntil, matched: await waitUntil.mock.results[0].value }
}

it('requeries until the count and every element’s attributes and nested properties match', async () => {
    const good = { getAttribute: () => 'ready', state: { flags: [false], extra: 1 } }
    const bad = { ...good, state: null }
    const attr = { ...good, getAttribute: () => 'loading' }
    const result = await runWait({
        count: 2, operator: '==', timeout: 1250,
        attributes: { 'data-state': 'ready' }, properties: { state: { flags: [false] } },
    }, [[good], [good, bad], [attr, good], [good, good]])
    expect(result.matched).toBe(true)
    expect(result.selector).toHaveBeenCalledTimes(4)
    expect(result.waitUntil).toHaveBeenCalledWith(expect.any(Function), { timeout: 1250 })
})

it('inverts the complete recorded condition for a hidden wait', async () => {
    const result = await runWait({ visible: false, properties: { value: 0 } }, [[{ value: 0 }], [{ value: 1 }]])
    expect(result.matched).toBe(true)
    expect(result.selector).toHaveBeenCalledTimes(2)
})

it('waits for absence with no attributes or properties', async () => {
    const result = await runWait({ visible: false }, [[{}], []])
    expect(result.matched).toBe(true)
    expect(result.selector).toHaveBeenCalledTimes(2)
})

it('honors a zero upper bound and safely quotes recorded property names', async () => {
    const result = await runWait({
        count: 0, operator: '<=', properties: { 'key"with quotes': 1 },
    }, [[{ 'key"with quotes': 1 }], []])
    expect(result.matched).toBe(true)
    expect(result.selector).toHaveBeenCalledTimes(2)
})
