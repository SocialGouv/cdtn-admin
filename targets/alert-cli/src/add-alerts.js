import { insertAlert, updateSource } from "./index";
import { promises as fs } from "fs";
import path from "path";

const filename =
  process.env.DUMP_FILE || path.join(__dirname, "..", "data", "dump.json");

async function main() {
  console.log(filename);
  const fileContent = await fs.readFile(filename);
  /** @type {alerts.RepoAlert[]} */
  const data = JSON.parse(fileContent.toString("utf-8"));

  for (const result of data) {
    if (result.changes.length === 0) {
      console.log(`no update for ${result.repository}`);
      continue;
    }
    const inserts = await Promise.all(
      result.changes.map((diff) => insertAlert(result.repository, diff))
    );
    inserts.forEach((insert) => {
      const { ref, repository, info } = insert;
      console.log(`insert alert for ${ref} on ${repository} (${info.file})`);
    });
    console.log(`create ${inserts.length} alert for ${result.repository}`);
    const update = await updateSource(result.repository, result.newRef);
    console.log(`update source ${update.repository} to ${update.tag}`);
  }
}

main().catch(console.error);
