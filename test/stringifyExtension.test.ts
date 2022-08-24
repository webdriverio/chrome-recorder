import { describe, it, expect } from 'vitest'
import { Key, UserFlow } from '@puppeteer/replay'

import { InMemoryLineWriter } from './InMemoryLineWriter.js'
import { StringifyExtension } from '../src/stringifyExtension.js'


describe('StringifyExtension', () => {
    it('creates async tests', async () => {
        const ext = new StringifyExtension()
        const writer = new InMemoryLineWriter('  ')
        await ext.beforeAllSteps(writer, { title: 'foobar' } as UserFlow)
        expect(writer.toString()).toContain('it("tests foobar", async () => {')
    })

    it('should correctly exports setViewport step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'setViewport' as const,
            width: 1905,
            height: 223,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
        }
        const flow = { title: 'setViewport step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('await browser.setWindowSize(1905, 223)\n')
    })

    it('should correctly exports navigate step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'navigate' as const,
            url: 'chrome://new-tab-page/',
        }
        const flow = { title: 'navigate step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('await browser.url("chrome://new-tab-page/")\n')
    })

    it('should correctly exports click step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'click' as const,
            target: 'main',
            selectors: ['#test'],
            offsetX: 1,
            offsetY: 1,
        }
        const flow = { title: 'click step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('await browser.$("#test").click()\n')
    })

    it('should correctly exports change step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'change' as const,
            value: 'webdriverio',
            selectors: [['aria/Search'], ['#heading']],
            target: 'main',
        }
        const flow = { title: 'change step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('await browser.$("#heading").setValue("webdriverio")\n')
    })

    it('should prefer link text selectors', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'change' as const,
            value: 'webdriverio',
            selectors: [[
                'aria/Guides'
            ], [
                '#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > aside > div > nav > ul > li:nth-child(4) > div > a'
            ]],
            target: 'main',
        }
        const flow = { title: 'change step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('await browser.$("=Guides").setValue("webdriverio")\n')
    })

    it('should fetch by text', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'change' as const,
            value: 'webdriverio',
            selectors: [[
                'aria/Flat White $18.00'
            ], [
                '#app > div:nth-child(4) > ul > li:nth-child(5) > h4'
            ]],
            target: 'main',
        }
        const flow = { title: 'change step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('await browser.$("h4=Flat White $18.00").setValue("webdriverio")\n')
    })

    it('should fetch by text with pseudo selector', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'change' as const,
            value: 'webdriverio',
            selectors: [[
                'aria/Yes'
            ], [
                '[data-cy=add-to-cart-modal] > form > button:nth-child(1)'
            ]],
            target: 'main',
        }
        const flow = { title: 'change step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('await browser.$("button=Yes").setValue("webdriverio")\n')
    })

    it('should correctly exports keyDown step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'keyDown' as const,
            target: 'main',
            key: 'Enter' as Key,
        }
        const flow = { title: 'keyDown step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe(
            'await browser.performActions([{\n' +
            '  type: \'key\',\n' +
            '  id: \'keyboard\',\n' +
            '  actions: [{ type: \'keyDown\', value: \'\uE007\' }]\n' +
            '}])\n'
        )
    })

    it('should handle keyDown step when key is not supported', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'keyDown' as const,
            target: 'main',
            key: 'KEY_DOESNT_EXIST' as Key,
        }
        const flow = { title: 'keyDown step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('\n')
    })

    it('should correctly exports keyUp step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'keyUp' as const,
            target: 'main',
            key: 'Enter' as Key
        }
        const flow = { title: 'keyUp step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe(
            'await browser.performActions([{\n' +
            '  type: \'key\',\n' +
            '  id: \'keyboard\',\n' +
            '  actions: [{ type: \'keyUp\', value: \'\uE007\' }]\n' +
            '}])\n'
        )
    })

    it('should correctly exports scroll step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'scroll' as const,
            target: 'main',
            x: 0,
            y: 805,
        }
        const flow = { title: 'scroll step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('await browser.execute(() => window.scrollTo(0, 805))\n')
    })

    it('should correctly exports doubleClick step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'doubleClick' as const,
            target: 'main',
            selectors: [['aria/Test'], ['#test']],
            offsetX: 1,
            offsetY: 1,
        }
        const flow = { title: 'doubleClick step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe('await browser.$("#test").doubleClick()\n')
    })

    it('should correctly exports emulateNetworkConditions step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'emulateNetworkConditions' as const,
            download: 50000,
            upload: 50000,
            latency: 2000,
        }
        const flow = { title: 'emulateNetworkConditions step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe(
            'await browser.setNetworkConditions({\n' +
            '  offline: false,\n' +
            '  latency: 2000,\n' +
            '  download_throughput: 50000,\n' +
            '  upload_throughput: 50000\n' +
            '})\n'
        )
    })

    it('should correctly exports waitForElement step if operator is "=="', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'waitForElement' as const,
            selectors: ['#test'],
            operator: '==' as const,
            count: 2,
        }
        const flow = { title: 'waitForElement step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe(
            'await expect(browser.$$("#test")).toBeElementsArrayOfSize(2)\n'
        )
    })

    it('should correctly exports waitForElement step with timeout', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'waitForElement' as const,
            selectors: ['#test'],
            operator: '==' as const,
            count: 2,
            timeout: 2000,
        }
        const flow = { title: 'waitForElement step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe(
            'await expect(browser.$$("#test")).toBeElementsArrayOfSize(2, { timeout: 2000 })\n'
        )
    })

    it('should correctly exports waitForElement step if operator is "<="', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'waitForElement' as const,
            selectors: ['#test'],
            operator: '<=' as const,
            count: 2,
        }
        const flow = { title: 'waitForElement step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe(
            'await expect(browser.$$("#test")).toBeElementsArrayOfSize({ lte: 2 })\n'
        )
    })

    it('should correctly exports waitForElement step if operator is ">="', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'waitForElement' as const,
            selectors: ['#test'],
            operator: '>=' as const,
            count: 2,
        }
        const flow = { title: 'waitForElement step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).toBe(
            'await expect(browser.$$("#test")).toBeElementsArrayOfSize({ gte: 2 })\n'
        )
    })

    it('should correctly add Hover Step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'hover' as const,
            selectors: ['#test'],
        }
        const flow = { title: 'Hover step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).to.equal('await browser.$("#test").moveTo()\n')
    })

    it('should correctly assert event after step', async () => {
        const ext = new StringifyExtension()
        const step = {
            type: 'hover' as const,
            selectors: ['#test'],
            assertedEvents: [{
                type: 'navigation' as const,
                url: 'https://webdriver.io',
                title: ''
            }]
        }
        const flow = { title: 'Hover step', steps: [step] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, step, flow)
        expect(writer.toString()).to.equal(
            'await browser.$("#test").moveTo()\n' +
            'await expect(browser).toHaveUrl("https://webdriver.io")\n'
        )
    })

    it('switches target if needed', async () => {
        const ext = new StringifyExtension()
        const stepA = {
            type: 'click' as const,
            target: 'main',
            selectors: ['#test'],
            offsetX: 1,
            offsetY: 1,
        }
        const stepB = {
            type: 'click' as const,
            target: 'https://webdriver.io',
            selectors: ['#test'],
            offsetX: 1,
            offsetY: 1,
        }
        const flow = { title: 'Hover step', steps: [stepA, stepB] }
        const writer = new InMemoryLineWriter('  ')
        await ext.stringifyStep(writer, stepA, flow)
        await ext.stringifyStep(writer, stepB, flow)
        expect(writer.toString()).to.equal(
            'await browser.$("#test").click()\n' +
            'await browser.switchToFrame(\n' +
            '  await browser.$(\'iframe[src="https://webdriver.io"]\')\n' +
            ')\n' +
            'await browser.$("#test").click()\n'
        )
    })
})
