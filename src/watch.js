import chokidar from "chokidar"
import { processFile } from "./files.js"


function watchDirectory(path, log, fileIgnoreQueue) {
    const watcher = chokidar.watch(path, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: true
    })

    watcher
        .on("add",    (path) => onFileEvent(path, log, fileIgnoreQueue))
        .on("change", (path) => onFileEvent(path, log, fileIgnoreQueue))
}

function onFileEvent(path, log, fileIgnoreQueue) {
    const isJavascript = new RegExp(/[\w\-]+\.js$/)
    if (!isJavascript.test(path))
        return

    if (fileIgnoreQueue.isQueued(path)) {
        fileIgnoreQueue.consume(path)
        return
    }

    const filename = path.slice(path.match(isJavascript).index)
    processFile(path, filename, log, fileIgnoreQueue)
}

export { watchDirectory }