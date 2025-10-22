import { getSimulatorReferences } from "../index";
import * as fetchModule from "../fetchSimulatorPackage";
import * as extractModule from "../extractSimulatorReferences";
import { mockPackageMetadata } from "../__mocks__/mockSimulatorData";
import { SOURCES } from "@socialgouv/cdtn-sources";

jest.mock("../fetchSimulatorPackage");
jest.mock("../extractSimulatorReferences");

const mockedFetch = fetchModule as jest.Mocked<typeof fetchModule>;
const mockedExtract = extractModule as jest.Mocked<typeof extractModule>;

describe("getSimulatorReferences", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch, extract, and cleanup successfully", async () => {
    const mockTempDir = "/tmp/simulator-abc123";
    const mockReferences = [
      {
        document: {
          id: "simulator-preavis-licenciement",
          source: SOURCES.TOOLS,
          title: "Simulateur preavis-licenciement",
          slug: "preavis-licenciement",
        },
        references: [
          {
            dila_id: "KALIARTI000005849509",
            dila_cid: "CID_KALIARTI000005849509",
            dila_container_id: "KALITEXT000005678903",
            title: "Article 13",
            url: "https://www.legifrance.gouv.fr/article/KALIARTI000005849509",
          },
        ],
      },
    ];

    mockedFetch.fetchPackageMetadata.mockResolvedValue(mockPackageMetadata);
    mockedFetch.downloadAndExtractTarball.mockResolvedValue(mockTempDir);
    mockedFetch.cleanupTempDirectory.mockReturnValue(undefined);
    mockedExtract.extractSimulatorReferences.mockResolvedValue(mockReferences);

    const result = await getSimulatorReferences();

    expect(result).toEqual(mockReferences);
    expect(mockedFetch.fetchPackageMetadata).toHaveBeenCalledWith(
      "@socialgouv/modeles-social"
    );
    expect(mockedFetch.downloadAndExtractTarball).toHaveBeenCalledWith(
      mockPackageMetadata.tarballUrl
    );
    expect(mockedExtract.extractSimulatorReferences).toHaveBeenCalledWith(
      mockTempDir
    );
    expect(mockedFetch.cleanupTempDirectory).toHaveBeenCalledWith(mockTempDir);
  });

  it("should cleanup temp directory even if extraction fails", async () => {
    const mockTempDir = "/tmp/simulator-abc123";
    const error = new Error("Extraction failed");

    mockedFetch.fetchPackageMetadata.mockResolvedValue(mockPackageMetadata);
    mockedFetch.downloadAndExtractTarball.mockResolvedValue(mockTempDir);
    mockedFetch.cleanupTempDirectory.mockReturnValue(undefined);
    mockedExtract.extractSimulatorReferences.mockRejectedValue(error);

    await expect(getSimulatorReferences()).rejects.toThrow("Extraction failed");
    expect(mockedFetch.cleanupTempDirectory).toHaveBeenCalledWith(mockTempDir);
  });

  it("should not attempt cleanup if download fails", async () => {
    const error = new Error("Download failed");

    mockedFetch.fetchPackageMetadata.mockResolvedValue(mockPackageMetadata);
    mockedFetch.downloadAndExtractTarball.mockRejectedValue(error);
    mockedFetch.cleanupTempDirectory.mockReturnValue(undefined);

    await expect(getSimulatorReferences()).rejects.toThrow("Download failed");
    expect(mockedFetch.cleanupTempDirectory).not.toHaveBeenCalled();
  });

  it("should handle metadata fetch failure", async () => {
    const error = new Error("Metadata fetch failed");

    mockedFetch.fetchPackageMetadata.mockRejectedValue(error);

    await expect(getSimulatorReferences()).rejects.toThrow(
      "Metadata fetch failed"
    );
    expect(mockedFetch.downloadAndExtractTarball).not.toHaveBeenCalled();
    expect(mockedExtract.extractSimulatorReferences).not.toHaveBeenCalled();
  });
});
