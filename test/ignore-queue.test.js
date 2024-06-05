import { createFileIgnoreQueue } from "../src/ignore-queue.js";

function a() {
    const queue = createFileIgnoreQueue()
    const path = "/testpath"
    queue.addFile(path)
    console.log(queue.isQueued(path))
    queue.consume(path)
    console.log(queue.isQueued(path))
}

a()