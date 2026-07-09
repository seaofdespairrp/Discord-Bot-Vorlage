const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

const writeQueues = new Map();

function queueWrite(filePath, task) {
  const previous = writeQueues.get(filePath) || Promise.resolve();
  const next = previous.then(task, task);
  writeQueues.set(filePath, next);
  return next;
}

async function readJson(fileName, fallback) {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeJson(fileName, fallback);
      return fallback;
    }
    throw err;
  }
}

async function writeJson(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  return queueWrite(filePath, async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  });
}

module.exports = { readJson, writeJson };
