import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";

export async function downloadFileInTempFolder(
  url: string,
  nameOfFile: string
): Promise<string> {
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, nameOfFile);

  const response = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}
