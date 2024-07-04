import { createConfig } from "./src/config.js"
import { createFileIgnoreQueue } from "./src/ignore-queue.js"
import { watchDirectory } from "./src/watch.js"
import { processDirectory } from "./src/files.js"


main()

// TODO: add new cli option for slow, to enable waitForWrite and ignore queue, disable by default
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
