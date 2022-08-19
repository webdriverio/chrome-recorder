import path from 'node:path'
import fs from 'node:fs/promises'
import { format } from 'prettier'
import chalk from 'chalk'

import { stringifyChromeRecording } from './index.js'
import { ExportToFile, TransformOpts } from './types.js'

const __dirname = path.resolve(path.dirname('.'))

export function formatParsedRecordingContent(
    transformedRecordingContent: string,
): string {
    return format(transformedRecordingContent, {
        semi: true,
        singleQuote: true,
        parser: 'babel',
    })
}

export async function runTransformsOnChromeRecording({ files, outputPath, flags }: TransformOpts) {
    const outputFolder = path.join(__dirname, outputPath)
    const { dry } = flags

    return files.map(async (file) => {
        console.log(
            chalk.green(`🤖 Running WebdriverIO Chrome Recorder on ${file}\n`),
        )

        const recordingContent = await fs.readFile(file, 'utf-8')
        const stringifiedFile = await stringifyChromeRecording(
            recordingContent,
        )

        if (!stringifiedFile) {
            return
        }

        const formattedStringifiedFile = formatParsedRecordingContent(stringifiedFile)
        const fileName = file.split('/').pop()
        const testName = fileName ? fileName.replace('.json', '') : undefined

        if (dry) {
            return console.log(formattedStringifiedFile)
        }

        if (!testName) {
            return chalk.red('Please try again. Now file or folder found')
        }

        exportFileToFolder({
            stringifiedFile: formattedStringifiedFile,
            testName,
            outputPath,
            outputFolder,
        })
    })
}

async function exportFileToFolder({ stringifiedFile, testName, outputPath, outputFolder }: ExportToFile): Promise<any> {
    const folderPath = path.join('.', outputPath)
    const folderExists = await fs.access(folderPath, fs.constants.F_OK).then(
        () => true,
        () => false
    )
    if (!folderExists) {
        return fs.mkdir(path.join('.', outputPath), {
            recursive: true,
        }).then(() => {
            return exportFileToFolder({
                stringifiedFile,
                testName,
                outputFolder,
                outputPath,
            })
        }, (err: Error) => {
            console.error(
                `😭 Something went wrong while creating ${outputPath}\n Stacktrace: ${err?.stack}`,
            )
        })
    }

    return fs.writeFile(
        path.join(outputFolder, `/${testName}.js`),
        stringifiedFile
    ).then(() => {
        console.log(
            chalk.green(
                `\n ✅ ${testName}.json exported to ${outputPath}/${testName}.js\n `,
            ),
        )
    }, () => {
        console.log(
            chalk.red(
                `\n 😭 Something went wrong exporting ${outputPath}/${testName}.js \n`,
            ),
        )
    })
}
