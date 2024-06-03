"use strict"
import chokidar from "chokidar"
import { Command } from "commander"
import fspromises from "node:fs/promises"
import path from "node:path"

// TODO: build in a delay that resets on each watch event, in case tsc triggers many with one compile. Only process files when delay expires
// unless it emits one event per changed file, in which case don't scan directories at all and just use the events to determine which files to process
main()

function main() {
    const config = createConfig(process.argv)
    processDirectory(config.rootDir, config.recursive, config.log)
}

function createConfig(argv) {
    const { watch, recursive, rootDir, log } = parseArgs(argv)

    const config = {
        watch,
        rootDir,
        recursive,
        log
    }
    return config
}

function parseArgs(argv) {
    const program = new Command()

    program
        .name("tse")
        .description("Adds .js extensions to import statements in your javascript files")
        .version("0.0.1")

    program
        .option("-w, --watch", "stay open to process files immediately after they're changed")
        .option("-r, --recursive", "also process subdirectories")
        .option("-d, --directory <directory>", "the base directory to process, defaults to current working directory")
        .option("-i, --info", "log info to console")

    program.parse(argv)
    const options = program.opts()
    
    return {
        watch: options["watch"] || false,
        recursive: options["recursive"] || false,
        rootDir: path.resolve(options["directory"] || process.cwd()),
        log: options["info"] || false
    }
}

async function processDirectory(path, recursive, log) {
    const dir = await fspromises.opendir(path)
    const isJavascript = new RegExp(/\.js$/)

    for await (const entry of dir) {
        if (entry.isFile() && isJavascript.test(entry.name)) {
            readFile(path + "/" + entry.name)
                .then((content) => processFileContent(content, entry.name, log))
        }
        else if (entry.isDirectory() && recursive) {
            processDirectory(path + "/" + entry.name, recursive, log)
        }
    }
}

function processFileContent(content, filename, log) {
    if (log)
        console.log(`Processing ${filename}`)

    const isImportStatement = new RegExp(/^import/)
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (!isImportStatement.test(line))
            continue

        const lastQuoteIndex = line.match(/[\"\'];*$/).index
        const processedLine = line.slice(0, lastQuoteIndex) + ".js" + line.slice(lastQuoteIndex)

        lines[i] = processedLine
    }

    const processedContent = lines.join("\n")
    return processedContent
}

function readFile(path) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await fspromises.readFile(path, { encoding: "utf-8" })
            resolve(data)
        } catch(error) {
            console.error(`Error reading file at ${path}: \n\t${error}`)
        }
    })
}