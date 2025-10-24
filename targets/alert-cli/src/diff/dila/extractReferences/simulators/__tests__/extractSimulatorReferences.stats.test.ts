import * as fs from "fs";
import * as path from "path";
import { mockSimulatorModels } from "../__mocks__/mockSimulatorData";
import { WarningRepository } from "../../../../../repositories/WarningRepository";

jest.mock("fs");

const mockGetArticleReference = jest.fn<
  Promise<{
    dila_id: string;
    dila_cid: string;
    dila_container_id: string;
    title: string;
    url: string;
  } | null>,
  [string]
>((id: string) =>
  Promise.resolve({
    dila_id: id,
    dila_cid: `CID_${id}`,
    dila_container_id: `CONTAINER_${id}`,
    title: `Article ${id}`,
    url: `https://www.legifrance.gouv.fr/article/${id}`,
  })
);

jest.mock("@shared/utils", () => ({
  createGetArticleReference: jest.fn(() => mockGetArticleReference),
  gqlClient: jest.fn(),
}));
jest.mock("@socialgouv/dila-api-client");
jest.mock("../../../../../repositories/WarningRepository");

import { extractSimulatorReferences } from "../extractSimulatorReferences";

const mockedFs = fs as jest.Mocked<typeof fs>;
const MockedWarningRepository = WarningRepository as jest.MockedClass<
  typeof WarningRepository
>;

describe("extractSimulatorReferences - Statistics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockedWarningRepository.prototype.saveWarning = jest.fn();

    mockGetArticleReference.mockImplementation((id: string) =>
      Promise.resolve({
        dila_id: id,
        dila_cid: `CID_${id}`,
        dila_container_id: `CONTAINER_${id}`,
        title: `Article ${id}`,
        url: `https://www.legifrance.gouv.fr/article/${id}`,
      })
    );
  });

  it("should display statistics about extracted references", async () => {
    const mockPackageDir = "/tmp/simulator-test";
    const modelesDir = path.join(mockPackageDir, "package", "lib", "modeles");

    mockedFs.existsSync.mockImplementation((filePath: any) => {
      if (filePath === modelesDir) return true;
      if (typeof filePath === "string" && filePath.includes("modeles-")) {
        return true;
      }
      return false;
    });

    mockedFs.readFileSync.mockImplementation((filePath: any) => {
      if (typeof filePath === "string") {
        if (filePath.includes("modeles-preavis-retraite.json")) {
          return JSON.stringify(mockSimulatorModels["preavis-retraite"]);
        }
        if (filePath.includes("modeles-rupture-conventionnelle.json")) {
          return JSON.stringify(mockSimulatorModels["rupture-conventionnelle"]);
        }
        if (filePath.includes("modeles-preavis-licenciement.json")) {
          return JSON.stringify(mockSimulatorModels["preavis-licenciement"]);
        }
        if (filePath.includes("modeles-preavis-demission.json")) {
          return JSON.stringify(mockSimulatorModels["preavis-demission"]);
        }
        if (filePath.includes("modeles-indemnite-licenciement.json")) {
          return JSON.stringify(mockSimulatorModels["indemnite-licenciement"]);
        }
        if (filePath.includes("modeles-indemnite-precarite.json")) {
          return JSON.stringify(mockSimulatorModels["indemnite-precarite"]);
        }
        if (filePath.includes("modeles-heures-recherche-emploi.json")) {
          return JSON.stringify(mockSimulatorModels["heures-recherche-emploi"]);
        }
      }
      return "{}";
    });

    const result = await extractSimulatorReferences(mockPackageDir);

    console.log("\n📊 Statistics per simulator:");
    console.log("=".repeat(80));

    let totalReferences = 0;
    const allUniqueIds = new Set<string>();

    for (const docRef of result) {
      const uniqueIds = new Set(docRef.references.map((ref) => ref.dila_id));
      totalReferences += docRef.references.length;
      for (const id of uniqueIds) {
        allUniqueIds.add(id);
      }

      console.log(`\n${docRef.document.title}:`);
      console.log(`  - Total references: ${docRef.references.length}`);
      console.log(`  - Unique article IDs: ${uniqueIds.size}`);
      console.log(
        `  - Sample IDs: ${Array.from(uniqueIds).slice(0, 3).join(", ")}`
      );
    }

    console.log("\n" + "=".repeat(80));
    console.log(`📈 GLOBAL STATISTICS:`);
    console.log(`  - Total simulators: ${result.length}`);
    console.log(`  - Total references: ${totalReferences}`);
    console.log(
      `  - Unique article IDs across all simulators: ${allUniqueIds.size}`
    );
    console.log("=".repeat(80) + "\n");

    // Verify we have all 7 simulators
    expect(result).toHaveLength(7);

    // Verify we have a good number of unique references
    expect(allUniqueIds.size).toBeGreaterThan(50);

    // Verify total references is substantial
    expect(totalReferences).toBeGreaterThan(100);
  });
});
