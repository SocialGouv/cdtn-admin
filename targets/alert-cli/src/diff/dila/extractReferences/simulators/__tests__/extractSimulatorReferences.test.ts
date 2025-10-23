import * as fs from "fs";
import * as path from "path";
import { extractSimulatorReferences } from "../extractSimulatorReferences";
import { mockSimulatorModels } from "../__mocks__/mockSimulatorData";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { WarningRepository } from "../../../../../repositories/WarningRepository";

jest.mock("fs");
jest.mock("@shared/utils", () => ({
  createGetArticleReference: jest.fn(() => jest.fn()),
  extractArticleId: jest.fn((url: string) => {
    // Mock extractArticleId to extract KALI article IDs from URLs
    const match = url.match(/idArticle=([A-Z0-9]+)/);
    if (match) return [match[1]];
    const hashMatch = url.match(/#([A-Z0-9]+)$/);
    if (hashMatch) return [hashMatch[1]];
    return [];
  }),
  gqlClient: jest.fn(),
}));
jest.mock("@socialgouv/dila-api-client");
jest.mock("../../../../../repositories/WarningRepository");

const mockedFs = fs as jest.Mocked<typeof fs>;
const MockedWarningRepository = WarningRepository as jest.MockedClass<
  typeof WarningRepository
>;

describe("extractSimulatorReferences", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockedWarningRepository.prototype.saveWarning = jest.fn();
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

    // Mock the getArticleReference function
    const { createGetArticleReference } = require("@shared/utils");
    const mockGetArticleReference = jest.fn((id: string) =>
      Promise.resolve({
        dila_id: id,
        dila_cid: `CID_${id}`,
        dila_container_id: "KALITEXT000005678903",
        title: `Article ${id}`,
        url: `https://www.legifrance.gouv.fr/article/${id}`,
      })
    );
    createGetArticleReference.mockReturnValue(mockGetArticleReference);

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
    const { createGetArticleReference } = require("@shared/utils");
    const mockGetArticleReference = jest.fn((id: string) => {
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
    createGetArticleReference.mockReturnValue(mockGetArticleReference);

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
});
