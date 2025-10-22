import type { DocumentReferences } from "@socialgouv/cdtn-types";
import memoizee from "memoizee";
import {
  fetchPackageMetadata,
  downloadAndExtractTarball,
  cleanupTempDirectory,
} from "./fetchSimulatorPackage";
import { extractSimulatorReferences } from "./extractSimulatorReferences";

const PACKAGE_NAME = "@socialgouv/modeles-social";

export async function getSimulatorReferences(): Promise<DocumentReferences[]> {
  let tempDir: string | null = null;

  try {
    console.log(`Fetching simulator package metadata for ${PACKAGE_NAME}...`);
    const packageInfo = await fetchPackageMetadata(PACKAGE_NAME);
    console.log(`Package version: ${packageInfo.version}`);

    console.log("Downloading and extracting tarball...");
    tempDir = await downloadAndExtractTarball(packageInfo.tarballUrl);

    console.log("Extracting references from simulator models...");
    const references = await extractSimulatorReferences(tempDir);
    console.log(
      `Found ${references.length} simulator documents with references`
    );
    console.log(JSON.stringify(references));
    return references;
  } catch (error: unknown) {
    console.error("Error fetching simulator references:", error);
    throw error;
  } finally {
    if (tempDir) {
      console.log("Cleaning up temporary directory...");
      cleanupTempDirectory(tempDir);
    }
  }
}

export default memoizee(getSimulatorReferences, { promise: true });
