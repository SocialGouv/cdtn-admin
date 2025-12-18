import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as tar from "tar";
import { Readable } from "stream";

jest.mock("axios");
jest.mock("fs");
jest.mock("tar");

// Mock stream.pipeline through util.promisify
const mockPipeline = jest.fn().mockResolvedValue(undefined);
jest.mock("util", () => {
  const actual = jest.requireActual("util");
  return {
    ...actual,
    promisify: jest.fn((fn) => {
      if (fn.name === "pipeline" || fn === require("stream").pipeline) {
        return mockPipeline;
      }
      return actual.promisify(fn);
    }),
  };
});

import {
  fetchPackageMetadata,
  downloadAndExtractTarball,
  cleanupTempDirectory,
} from "../fetchSimulatorPackage";

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedTar = tar as jest.Mocked<typeof tar>;

describe("fetchSimulatorPackage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPipeline.mockClear();
    mockPipeline.mockResolvedValue(undefined);
  });

  describe("fetchPackageMetadata", () => {
    it("should fetch package metadata successfully", async () => {
      const mockResponse = {
        data: {
          version: "4.195.1",
          dist: {
            tarball:
              "https://registry.npmjs.org/@socialgouv/modeles-social/-/modeles-social-4.195.1.tgz",
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await fetchPackageMetadata("@socialgouv/modeles-social");

      expect(result).toEqual({
        tarballUrl:
          "https://registry.npmjs.org/@socialgouv/modeles-social/-/modeles-social-4.195.1.tgz",
        version: "4.195.1",
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://registry.npmjs.org/@socialgouv/modeles-social/latest"
      );
    });

    it("should throw error when tarball is not found", async () => {
      const mockResponse = {
        data: {
          version: "4.195.1",
          dist: {},
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await expect(
        fetchPackageMetadata("@socialgouv/modeles-social")
      ).rejects.toThrow(
        "No tarball found for package @socialgouv/modeles-social"
      );
    });

    it("should throw error when axios request fails", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network error"));

      await expect(
        fetchPackageMetadata("@socialgouv/modeles-social")
      ).rejects.toThrow("Failed to fetch package metadata");
    });
  });

  describe("downloadAndExtractTarball", () => {
    it("should download and extract tarball successfully", async () => {
      const mockTempDir = "/tmp/simulator-abc123";
      const mockTarballPath = path.join(mockTempDir, "package.tgz");

      // Create a mock stream
      const mockStream = new Readable();
      mockStream.push("mock data");
      mockStream.push(null);

      const mockWriteStream: any = {
        on: jest.fn((event: string, handler: () => void): any => {
          if (event === "finish") {
            setTimeout(() => handler(), 0);
          }
          return mockWriteStream;
        }),
        write: jest.fn(),
        end: jest.fn(),
      };

      mockedFs.mkdtempSync.mockReturnValue(mockTempDir);
      mockedFs.createWriteStream.mockReturnValue(mockWriteStream as any);
      mockedAxios.get.mockResolvedValue({ data: mockStream } as any);
      (mockedTar.extract as jest.Mock).mockResolvedValue(undefined);
      mockedFs.unlinkSync.mockReturnValue(undefined);

      const result = await downloadAndExtractTarball(
        "https://registry.npmjs.org/@socialgouv/modeles-social/-/modeles-social-4.195.1.tgz"
      );

      expect(result).toBe(mockTempDir);
      expect(mockedFs.mkdtempSync).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://registry.npmjs.org/@socialgouv/modeles-social/-/modeles-social-4.195.1.tgz",
        { responseType: "stream" }
      );
      expect(mockPipeline).toHaveBeenCalled();
      expect(mockedTar.extract).toHaveBeenCalledWith({
        file: mockTarballPath,
        cwd: mockTempDir,
      });
      expect(mockedFs.unlinkSync).toHaveBeenCalledWith(mockTarballPath);
    });

    it("should cleanup on error", async () => {
      const mockTempDir = "/tmp/simulator-abc123";

      mockedFs.mkdtempSync.mockReturnValue(mockTempDir);
      mockedAxios.get.mockRejectedValue(new Error("Download failed"));
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.rmSync.mockReturnValue(undefined);

      await expect(
        downloadAndExtractTarball("https://example.com/package.tgz")
      ).rejects.toThrow("Failed to download and extract tarball");

      expect(mockedFs.rmSync).toHaveBeenCalledWith(mockTempDir, {
        recursive: true,
        force: true,
      });
    });
  });

  describe("cleanupTempDirectory", () => {
    it("should remove directory if it exists", () => {
      const mockTempDir = "/tmp/simulator-abc123";

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.rmSync.mockReturnValue(undefined);

      cleanupTempDirectory(mockTempDir);

      expect(mockedFs.existsSync).toHaveBeenCalledWith(mockTempDir);
      expect(mockedFs.rmSync).toHaveBeenCalledWith(mockTempDir, {
        recursive: true,
        force: true,
      });
    });

    it("should not throw error if directory does not exist", () => {
      const mockTempDir = "/tmp/simulator-abc123";

      mockedFs.existsSync.mockReturnValue(false);

      expect(() => cleanupTempDirectory(mockTempDir)).not.toThrow();
      expect(mockedFs.rmSync).not.toHaveBeenCalled();
    });
  });
});
