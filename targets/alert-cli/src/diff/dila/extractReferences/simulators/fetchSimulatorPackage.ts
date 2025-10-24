import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as tar from "tar";
import { promisify } from "util";
import * as stream from "stream";
import * as os from "os";

const pipeline = promisify(stream.pipeline);

export interface SimulatorPackageInfo {
  tarballUrl: string;
  version: string;
}

export async function fetchPackageMetadata(
  packageName: string
): Promise<SimulatorPackageInfo> {
  const registryUrl = `https://registry.npmjs.org/${packageName}/latest`;

  try {
    const response = await axios.get(registryUrl);
    const { dist } = response.data;

    if (!dist?.tarball) {
      throw new Error(`No tarball found for package ${packageName}`);
    }

    return {
      tarballUrl: dist.tarball,
      version: response.data.version || "unknown",
    };
  } catch (error: unknown) {
    throw new Error(
      `Failed to fetch package metadata for ${packageName}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function downloadAndExtractTarball(
  tarballUrl: string
): Promise<string> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "simulator-"));
  const tarballPath = path.join(tempDir, "package.tgz");

  try {
    const response = await axios.get(tarballUrl, {
      responseType: "stream",
    });

    const writeStream = fs.createWriteStream(tarballPath);
    await pipeline(response.data, writeStream);

    await tar.extract({
      file: tarballPath,
      cwd: tempDir,
    });

    fs.unlinkSync(tarballPath);

    return tempDir;
  } catch (error: unknown) {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    throw new Error(
      `Failed to download and extract tarball: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export function cleanupTempDirectory(tempDir: string): void {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
