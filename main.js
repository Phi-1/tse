import path from "node:path"
import { Command } from "commander"
import { createFileIgnoreQueue } from "./src/ignore-queue.js"
import { watchDirectory } from "./src/watch.js"
import { processDirectory } from "./src/files.js"


main()

function main() {
    const config = createConfig(process.argv)

    if (config.watch) {
        const fileIgnoreQueue = createFileIgnoreQueue()
        watchDirectory(config.rootDir, config.log, fileIgnoreQueue)
    }
    else {
        processDirectory(config.rootDir, config.recursive, config.log)
    }
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

