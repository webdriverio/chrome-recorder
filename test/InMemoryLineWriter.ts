import { LineWriter } from '@puppeteer/replay'

export class InMemoryLineWriter implements LineWriter {
    #indentation: string
    #currentIndentation = 0
    #lines: string[] = []

    constructor(indentation: string) {
        this.#indentation = indentation
    }

    appendLine(line: string): LineWriter {
        const indentedLine = line
            ? this.#indentation.repeat(this.#currentIndentation) + line.trimEnd()
            : ''
        this.#lines.push(indentedLine)
        return this
    }

    startBlock(): LineWriter {
        this.#currentIndentation++
        return this
    }

    endBlock(): LineWriter {
        this.#currentIndentation--
        return this
    }

    toString(): string {
        // Scripts should end with a final blank line.
        return this.#lines.join('\n') + '\n'
    }

    getIndent(): string {
        return this.#indentation
    }

    getLines(): string[] {
        return this.#lines
    }

    getSize(): number {
        return this.#lines.length
    }
}
