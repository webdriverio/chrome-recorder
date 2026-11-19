import { expect, it, vi } from 'vitest'

const { runTransforms, cli } = vi.hoisted(() => ({
    runTransforms: vi.fn(),
    cli: { input: [] as string[], flags: { dry: true } },
}))

vi.mock('meow', () => ({ default: () => cli }))
vi.mock('inquirer', () => ({
    default: { prompt: async () => ({ files: ' one.json\t two.json ', outputPath: 'out' }) },
}))
vi.mock('../src/transform.js', () => ({ runTransformsOnChromeRecording: runTransforms }))

it.each([
    { args: [], expected: ['one.json', 'two.json'] },
    { args: ['a board.json'], expected: ['a board.json'] },
])('passes the path list to the exporter for arguments $args', async ({ args, expected }) => {
    vi.resetModules()
    runTransforms.mockClear()
    cli.input = args
    await import('../src/cli/index.js')
    expect(runTransforms).toHaveBeenCalledWith({
        files: expected, outputPath: 'out', flags: { dry: true },
    })
})
