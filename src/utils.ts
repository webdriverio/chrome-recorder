import { globbySync } from 'globby'
import type { Selector } from '@puppeteer/replay'

export function expandedFiles(files: string[]): string[] {
    const containsGlob = files.some((file: string) => file.includes('*'))
    return containsGlob ? globbySync(files) : files
}

export function formatAsJSLiteral(value: string) {
    return JSON.stringify(value)
}

export function findByCondition(
    selectors: Selector[],
    condition: (selector: string) => boolean
) {
    const ariaSelector = selectors.find((selector) => Array.isArray(selector)
        ? selector.find(condition)
        : condition(selector) ?? selector
    )
    if (ariaSelector) {
        return formatAsJSLiteral(Array.isArray(ariaSelector)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ? ariaSelector.find(condition)!
            : ariaSelector
        )
    }
}
