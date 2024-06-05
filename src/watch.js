import chokidar from "chokidar"
import { processFile } from "./files.js"


function watchDirectory(path, log, fileIgnoreQueue) {
    const watcher = chokidar.watch(path, {
        persistent: true
    })

    watcher
        .on("add",    (path) => onFileEvent(path, log, fileIgnoreQueue))
        .on("change", (path) => onFileEvent(path, log, fileIgnoreQueue))
}

function onFileEvent(path, log, fileIgnoreQueue) {
    const isJavascript = new RegExp(/[\w\-]+\.js$/)
    if (!isJavascript.test(path))
        return

    // FIXME: temporarily disabling ignore queue due to inconsistent behaviour from events
    // events seem to trigger on tse's file save at the start of the program, but not after
    // TODO: test on larger programs, if it duplicates events too much find a different solution
    //if (fileIgnoreQueue.isQueued(path)) {
        //console.log(`Ignoring file ${path}`)
        //fileIgnoreQueue.consume(path)
        //return
    //}

    const filename = path.slice(path.match(isJavascript).index)
    processFile(path, filename, log, fileIgnoreQueue)
}

export { watchDirectory }