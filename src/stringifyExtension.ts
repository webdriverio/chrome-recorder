import {
    ChangeStep,
    ClickStep,
    DoubleClickStep,
    EmulateNetworkConditionsStep,
    HoverStep,
    KeyDownStep,
    KeyUpStep,
    LineWriter,
    NavigateStep,
    PuppeteerStringifyExtension,
    ScrollStep,
    Selector,
    SetViewportStep,
    Step,
    UserFlow,
    WaitForElementStep,
    WaitForExpressionStep
} from '@puppeteer/replay'
import { formatAsJSLiteral } from './utils.js'
import { SUPPORTED_KEYS, KEY_NOT_SUPPORTED_ERROR } from './constants.js'

const ARIA_PREFIX = 'aria/'
const DEFAULT_TARGET = 'main'

export class StringifyExtension extends PuppeteerStringifyExtension {
    #target = DEFAULT_TARGET

    async beforeAllSteps(out: LineWriter, flow: UserFlow): Promise<void> {
        out
            .appendLine(`describe(${formatAsJSLiteral(flow.title)}, () => {`)
            .startBlock()
        out
            .appendLine(`it(${formatAsJSLiteral(`tests ${flow.title}`)}, async () => {`)
            .startBlock()
    }

    async afterAllSteps(out: LineWriter): Promise<void> {
        out.endBlock().appendLine('});')
        out.endBlock().appendLine('});')
    }

    async stringifyStep(
        out: LineWriter,
        step: Step,
        flow: UserFlow,
    ): Promise<void> {
        this.#appendContext(out, step)
        this.#appendStepType(out, step, flow)
        this.#appendAssertedEvents(out, step)
    }

    #appendStepType(out: LineWriter, step: Step, flow: UserFlow): void {
        switch (step.type) {
        case 'setViewport':
            return this.#appendViewportStep(out, step)
        case 'navigate':
            return this.#appendNavigateStep(out, step)
        case 'click':
            return this.#appendClickStep(out, step, flow)
        case 'change':
            return this.#appendChangeStep(out, step, flow)
        case 'keyDown':
            return this.#appendKeyDownStep(out, step)
        case 'keyUp':
            return this.#appendKeyUpStep(out, step)
        case 'scroll':
            return this.#appendScrollStep(out, step, flow)
        case 'doubleClick':
            return this.#appendDoubleClickStep(out, step, flow)
        case 'emulateNetworkConditions':
            return this.#appendEmulateNetworkConditionsStep(out, step)
        case 'hover':
            return this.#appendHoverStep(out, step, flow)
        case 'waitForElement':
            return this.#appendWaitForElementStep(out, step, flow)
        case 'waitForExpression':
            return this.#appendWaitExpressionStep(out, step)
        default:
            return this.logStepsNotImplemented(step)
        }
    }

    #appendAssertedEvents(out: LineWriter, step: Step) {
        if (!step.assertedEvents || step.assertedEvents.length === 0) {
            return
        }

        for (const event of step.assertedEvents) {
            switch (event.type) {
            case 'navigation':
                if (event.url) {
                    out.appendLine(`await expect(browser).toHaveUrl(${formatAsJSLiteral(event.url)})`)
                }
            }
        }
    }

    #appendContext(out: LineWriter, step: Step) {
        if (!step.target || step.target === this.#target) {
            return
        }

        if (step.target === DEFAULT_TARGET) {
            out.appendLine('await browser.switchToParentFrame()')
            return
        }

        out.appendLine('await browser.switchToFrame(').startBlock()
        out.appendLine(  `await browser.$('iframe[src="${step.target}"]')`).endBlock()
        out.appendLine(')')
    }

    #appendNavigateStep(out: LineWriter, step: NavigateStep): void {
        out.appendLine(`await browser.url(${formatAsJSLiteral(step.url)})`)
    }

    #appendViewportStep(out: LineWriter, step: SetViewportStep): void {
        out.appendLine(`await browser.setWindowSize(${step.width}, ${step.height})`)
    }

    #appendClickStep(out: LineWriter, step: ClickStep, flow: UserFlow): void {
        const domSelector = this.getSelector(step.selectors, flow)

        const hasRightButton = step.button && step.button === 'secondary'
        if (domSelector) {
            hasRightButton
                ? out.appendLine(`await browser.$(${domSelector}).click({ button: 'right' })`)
                : out.appendLine(`await browser.$(${domSelector}).click()`)
            return
        }
        console.log(`Warning: The click on ${step.selectors} was not able to export to WebdriverIO. Please adjust selectors and try again`)
    }

    #appendChangeStep(out: LineWriter, step: ChangeStep, flow: UserFlow): void {
        const domSelector = this.getSelector(step.selectors, flow)
        if (domSelector) {
            out.appendLine(`await browser.$(${domSelector}).setValue(${formatAsJSLiteral(step.value)})`)
        }
    }

    #appendKeyDownStep(out: LineWriter, step: KeyDownStep): void {
        const pressedKey = step.key.toLowerCase() as keyof typeof SUPPORTED_KEYS

        if (!SUPPORTED_KEYS[pressedKey]) {
            return console.error(KEY_NOT_SUPPORTED_ERROR, pressedKey)
        }

        const keyValue = SUPPORTED_KEYS[pressedKey]
        out.appendLine('await browser.performActions([{').startBlock()
        out.appendLine(  'type: \'key\',')
        out.appendLine(  'id: \'keyboard\',')
        out.appendLine(  `actions: [{ type: 'keyDown', value: '${keyValue}' }]`).endBlock()
        out.appendLine('}])')
    }

    #appendKeyUpStep(out: LineWriter, step: KeyUpStep): void {
        const pressedKey = step.key.toLowerCase() as keyof typeof SUPPORTED_KEYS

        if (!SUPPORTED_KEYS[pressedKey]) {
            return console.error(KEY_NOT_SUPPORTED_ERROR, pressedKey)
        }

        const keyValue = SUPPORTED_KEYS[pressedKey]
        out.appendLine('await browser.performActions([{').startBlock()
        out.appendLine(  'type: \'key\',')
        out.appendLine(  'id: \'keyboard\',')
        out.appendLine(  `actions: [{ type: 'keyUp', value: '${keyValue}' }]`).endBlock()
        out.appendLine('}])')
    }

    #appendScrollStep(out: LineWriter, step: ScrollStep, flow: UserFlow): void {
        if ('selectors' in step) {
            const domSelector = this.getSelector(step.selectors, flow)
            out.appendLine(`await browser.$(${domSelector}).moveTo()`)
            return
        }

        out.appendLine(`await browser.execute(() => window.scrollTo(${step.x}, ${step.y}))`)
    }

    #appendDoubleClickStep(
        out: LineWriter,
        step: DoubleClickStep,
        flow: UserFlow,
    ): void {
        const domSelector = this.getSelector(step.selectors, flow)

        if (!domSelector) {
            console.log(
                `Warning: The click on ${step.selectors} was not able to be exported to WebdriverIO. Please adjust your selectors and try again.`,
            )
            return
        }

        out.appendLine(`await browser.$(${domSelector}).doubleClick()`)
    }

    #appendHoverStep(out: LineWriter, step: HoverStep, flow: UserFlow): void {
        const domSelector = this.getSelector(step.selectors, flow)

        if (!domSelector) {
            console.log(
                `Warning: The Hover on ${step.selectors} was not able to be exported to WebdriverIO. Please adjust your selectors and try again.`,
            )
            return
        }

        out.appendLine(`await browser.$(${domSelector}).moveTo()`)
    }

    #appendEmulateNetworkConditionsStep(
        out: LineWriter,
        step: EmulateNetworkConditionsStep,
    ): void {
        out.appendLine('await browser.setNetworkConditions({').startBlock()
        out.appendLine(  'offline: false,')
        out.appendLine(  `latency: ${step.latency},`)
        out.appendLine(  `download_throughput: ${step.download},`)
        out.appendLine(  `upload_throughput: ${step.upload}`).endBlock()
        out.appendLine('})')
    }

    #appendWaitForElementStep(
        out: LineWriter,
        step: WaitForElementStep,
        flow: UserFlow,
    ): void {
        const domSelector = this.getSelector(step.selectors, flow)

        if (!domSelector) {
            console.log(
                `Warning: The WaitForElement on ${step.selectors} was not able to be exported to WebdriverIO. Please adjust your selectors and try again.`,
            )
        }

        const opts = step.timeout ? `, { timeout: ${step.timeout} }` : ''
        switch (step.operator) {
        case '<=':
            out.appendLine(`await expect(browser.$$(${domSelector})).toBeElementsArrayOfSize({ lte: ${step.count} }${opts})`)
            break
        case '==':
            out.appendLine(`await expect(browser.$$(${domSelector})).toBeElementsArrayOfSize(${step.count}${opts})`)
            break
        case '>=':
            out.appendLine(`await expect(browser.$$(${domSelector})).toBeElementsArrayOfSize({ gte: ${step.count} }${opts})`)
            break
        }
    }

    #appendWaitExpressionStep(
        out: LineWriter,
        step: WaitForExpressionStep
    ): void {
        out.appendLine(`await browser.executeAsync(async () => ${step.expression})`)
    }

    getSelector(selectors: Selector[], flow: UserFlow): string | undefined {
        /**
         * check if selector is a link, e.g.
         * ```
         * "selectors": [
         *   [
         *     "aria/Timeouts"
         *   ],
         *   [
         *     "#__docusaurus > div.main-wrapper.docs-wrapper.docs-doc-page > div > aside > div > nav > ul > li:nth-child(4) > ul > li:nth-child(2) > a"
         *   ]
         * ],
         * ```
         * then use link selector
         */
        if (
            Array.isArray(selectors[0]) && Array.isArray(selectors[1]) &&
            selectors[0][0].startsWith(ARIA_PREFIX) &&
            selectors[1][0].endsWith('> a')
        ) {
            return formatAsJSLiteral(`=${selectors[0][0].slice(ARIA_PREFIX.length)}`)
        }

        /**
         * check if selector is an element with text, e.g.
         * ```
         * "selectors": [
         *   [
         *     "aria/Flat White $18.00"
         *   ],
         *   [
         *     "#app > div:nth-child(4) > ul > li:nth-child(5) > h4"
         *   ]
         * ],
         * ```
         * then use element with text selector: h4=Flat White $18.00
         */
        if (
            Array.isArray(selectors[0]) && Array.isArray(selectors[1]) &&
            selectors[0][0].startsWith(ARIA_PREFIX) &&
            selectors[1][0].includes(' > ')
        ) {
            const tagName = selectors[1][0].split('>').pop()!.trim()
                // replace "button:nth-child(1)" with "button"
                .split(':')[0]
            return formatAsJSLiteral(`${tagName}=${selectors[0][0].slice(ARIA_PREFIX.length)}`)
        }

        // Remove Aria selectors
        const nonAriaSelectors = this.filterArrayByString(selectors, ARIA_PREFIX)

        let preferredSelector

        // Give preference to user selector
        if (flow.selectorAttribute) {
            preferredSelector = this.filterArrayByString(
                nonAriaSelectors,
                flow.selectorAttribute,
            )
        }

        if (preferredSelector && preferredSelector[0]) {
            return formatAsJSLiteral(
                Array.isArray(preferredSelector[0])
                    ? preferredSelector[0][0]
                    : preferredSelector[0],
            )
        }

        return formatAsJSLiteral(
            Array.isArray(nonAriaSelectors[0])
                ? nonAriaSelectors[0][0]
                : nonAriaSelectors[0],
        )
    }

    filterArrayByString(selectors: Selector[], filterValue: string): Selector[] {
        return selectors.filter((selector) =>
            filterValue === 'aria/'
                ? !selector[0].includes(filterValue)
                : selector[0].includes(filterValue),
        )
    }

    logStepsNotImplemented(step: Step): void {
        console.log(
            `Warning: WebdriverIO Chrome Recorder does not handle migration of types ${step.type}.`,
        )
    }
}
