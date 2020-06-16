const { promises: fs } = require("fs");
const path = require("path");
const filename =
  process.env.DUMP || path.join(__dirname, "..", "data", "dump.json");
const { updateSource, insertAlert } = require("./update-alerts");

async function main() {
  const fileContent = (await fs.readFile(filename)).toString();
  const data = JSON.parse(fileContent);

  for (const result of data) {
    if (result.changes.length === 0) {
      console.log(`no update for ${result.repository}`);
      continue;
    }
    const inserts = await Promise.all(
      result.changes.map((diff) => insertAlert(result.repository, diff))
    );
    inserts.forEach((insert) => {
      console.log("insert alert", insert.returning[0]);
    });
    const update = await updateSource(result.repository, result.newRef);
    console.log(`update source ${update.repository} to ${update.tag}`);
  }
  return Promise.resolve();
}

main().catch(console.error);
