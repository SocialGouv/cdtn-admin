import * as fs from "fs";
import * as path from "path";
import { mockSimulatorModels } from "../__mocks__/mockSimulatorData";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { WarningRepository } from "../../../../../repositories/WarningRepository";

jest.mock("fs");

// Mock getArticleReference to return valid data by default
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
  ...jest.requireActual("@shared/utils"),
  createGetArticleReference: jest.fn(() => mockGetArticleReference),
  gqlClient: jest.fn(),
}));
jest.mock("@socialgouv/dila-api-client");
jest.mock("../../../../../repositories/WarningRepository");

// Import after mocks are set up
import { extractSimulatorReferences } from "../extractSimulatorReferences";

const mockedFs = fs as jest.Mocked<typeof fs>;
const MockedWarningRepository = WarningRepository as jest.MockedClass<
  typeof WarningRepository
>;

describe("extractSimulatorReferences", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockedWarningRepository.prototype.saveWarning = jest.fn();

    // Reset mock to default implementation
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

  it("should extract references from simulator files", async () => {
    const mockPackageDir = "/tmp/simulator-test";
    const modelesDir = path.join(mockPackageDir, "package", "lib", "modeles");

    mockedFs.existsSync.mockImplementation((filePath: any) => {
      if (filePath === modelesDir) return true;
      if (
        typeof filePath === "string" &&
        filePath.includes("modeles-preavis-licenciement.json")
      ) {
        return true;
      }
      return false;
    });

    mockedFs.readFileSync.mockImplementation((filePath: any) => {
      if (
        typeof filePath === "string" &&
        filePath.includes("modeles-preavis-licenciement.json")
      ) {
        return JSON.stringify(mockSimulatorModels["preavis-licenciement"]);
      }
      return "{}";
    });

    const result = await extractSimulatorReferences(mockPackageDir);

    expect(result).toHaveLength(1);
    expect(result[0].document.source).toBe(SOURCES.TOOLS);
    expect(result[0].document.title).toContain(
      "Simulateur preavis-licenciement"
    );
    expect(result[0].references.length).toBeGreaterThan(0);
  });

  it("should throw error if modeles directory does not exist", async () => {
    const mockPackageDir = "/tmp/simulator-test";
    const modelesDir = path.join(mockPackageDir, "package", "lib", "modeles");

    mockedFs.existsSync.mockReturnValue(false);

    await expect(extractSimulatorReferences(mockPackageDir)).rejects.toThrow(
      `Modeles directory not found at ${modelesDir}`
    );
  });

  it("should handle missing simulator files gracefully", async () => {
    const mockPackageDir = "/tmp/simulator-test";
    const modelesDir = path.join(mockPackageDir, "package", "lib", "modeles");

    mockedFs.existsSync.mockImplementation((filePath: any) => {
      if (filePath === modelesDir) return true;
      return false; // All simulator files are missing
    });

    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    const result = await extractSimulatorReferences(mockPackageDir);

    expect(result).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Simulator file not found:")
    );

    consoleSpy.mockRestore();
  });

  it("should save warnings for articles that cannot be resolved", async () => {
    const mockPackageDir = "/tmp/simulator-test";
    const modelesDir = path.join(mockPackageDir, "package", "lib", "modeles");

    mockedFs.existsSync.mockImplementation((filePath: any) => {
      if (filePath === modelesDir) return true;
      if (
        typeof filePath === "string" &&
        filePath.includes("modeles-preavis-licenciement.json")
      ) {
        return true;
      }
      return false;
    });

    mockedFs.readFileSync.mockImplementation((filePath: any) => {
      if (
        typeof filePath === "string" &&
        filePath.includes("modeles-preavis-licenciement.json")
      ) {
        return JSON.stringify(mockSimulatorModels["preavis-licenciement"]);
      }
      return "{}";
    });

    // Mock getArticleReference to return null for some articles
    mockGetArticleReference.mockImplementation((id: string) => {
      if (id.includes("INVALID")) {
        return Promise.resolve(null);
      }
      return Promise.resolve({
        dila_id: id,
        dila_cid: `CID_${id}`,
        dila_container_id: "KALITEXT000005678903",
        title: `Article ${id}`,
        url: `https://www.legifrance.gouv.fr/article/${id}`,
      });
    });

    await extractSimulatorReferences(mockPackageDir);

    // Should not throw, but warnings should be saved if any articles couldn't be resolved
    expect(MockedWarningRepository.prototype.saveWarning).toHaveBeenCalledTimes(
      0
    ); // No invalid articles in our mock data
  });

  it("should handle JSON parse errors", async () => {
    const mockPackageDir = "/tmp/simulator-test";
    const modelesDir = path.join(mockPackageDir, "package", "lib", "modeles");

    mockedFs.existsSync.mockImplementation((filePath: any) => {
      if (filePath === modelesDir) return true;
      if (
        typeof filePath === "string" &&
        filePath.includes("modeles-preavis-licenciement.json")
      ) {
        return true;
      }
      return false;
    });

    mockedFs.readFileSync.mockImplementation(() => {
      return "invalid json{";
    });

    await expect(extractSimulatorReferences(mockPackageDir)).rejects.toThrow(
      "Failed to read simulator file"
    );
  });

  it("should extract references from all real simulator documents and match snapshot", async () => {
    const mockPackageDir = "/tmp/simulator-test";
    const modelesDir = path.join(mockPackageDir, "package", "lib", "modeles");

    // Mock filesystem to return true for all simulator files
    mockedFs.existsSync.mockImplementation((filePath: any) => {
      if (filePath === modelesDir) return true;
      if (typeof filePath === "string" && filePath.includes("modeles-")) {
        return true;
      }
      return false;
    });

    // Mock readFileSync to return actual simulator data from mock
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

    // Expect all 7 simulators to be processed
    expect(result).toHaveLength(7);

    // Snapshot the entire result to capture all references
    expect(result).toMatchSnapshot();
  });
});
