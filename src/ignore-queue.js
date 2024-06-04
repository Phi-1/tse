function createFileIgnoreQueue() {
    const queue = {}
    return {
        addFile: (path) => {
            if (path in queue)
                queue[path]++
            else
                queue[path] = 1
        },
        consume: (path) => {
            if (!(path in queue))
                console.error("Ignored file that wasn't marked, please let dev know")
            else
                queue[path]--
        },
        isQueued: (path) => path in queue && queue[path] > 0
    } 
}

export { createFileIgnoreQueue }