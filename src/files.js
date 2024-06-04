import fspromises from "node:fs/promises"


async function processDirectory(path, recursive, log) {
    const dir = await fspromises.opendir(path)
    const isJavascript = new RegExp(/\.js$/)

    for await (const entry of dir) {
        if (entry.isFile() && isJavascript.test(entry.name)) {
            processFile(path + "/" + entry.name, entry.name, log, null)
        }
        else if (entry.isDirectory() && recursive) {
            processDirectory(path + "/" + entry.name, recursive, log)
        }
    }
}

async function processFile(path, filename, log, fileIgnoreQueue) {
    try {
        const content = await readFile(path)
        const processed = processFileContent(content, filename, log)
        fspromises.writeFile(path, processed, { encoding: "utf-8" })
        if (fileIgnoreQueue)
            fileIgnoreQueue.addFile(path)
    } catch(error) {
        console.error("Error processing file: " + path)
    }
}

function processFileContent(content, filename, log) {
    if (log)
        console.log(`Processing ${filename}`)

    const isImportStatement = new RegExp(/^import/)
    const hasFileExtension = new RegExp(/\.js/)
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (!isImportStatement.test(line))
            continue
        if (hasFileExtension.test(line))
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

export { processDirectory, processFile }