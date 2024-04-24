import { isUploadFileSafe, isAllowedFile } from "../secu";
import * as formidable from "formidable";
import fs from "fs";

jest.mock("fs");

describe("secu.ts", () => {
  describe("isAllowedFile", () => {
    test("should return true for allowed extensions", () => {
      const file: formidable.File = {
        originalFilename: "test.png",
      } as formidable.File;

      expect(isAllowedFile(file)).toBe(true);
    });

    test("should return false for disallowed extensions", () => {
      const file: formidable.File = {
        originalFilename: "test.exe",
      } as formidable.File;

      expect(isAllowedFile(file)).toBe(false);
    });

    test("should return false if filename is undefined", () => {
      const file: formidable.File = {
        originalFilename: undefined,
      } as any;

      expect(isAllowedFile(file)).toBe(false);
    });
  });

  describe("isUploadFileSafe", () => {
    test("should resolve false for disallowed file extensions", async () => {
      const file: formidable.File = {
        originalFilename: "test.exe",
        mimetype: "application/octet-stream",
      } as formidable.File;

      await expect(isUploadFileSafe(file)).resolves.toBe(false);
    });

    test("should resolve true for non-SVG file types", async () => {
      const file: formidable.File = {
        originalFilename: "test.png",
        mimetype: "image/png",
      } as formidable.File;

      await expect(isUploadFileSafe(file)).resolves.toBe(true);
    });

    test("should resolve true for SVG files without script tags", async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue("<svg></svg>");

      const file: formidable.File = {
        originalFilename: "test.svg",
        mimetype: "image/svg+xml",
      } as formidable.File;

      await expect(isUploadFileSafe(file)).resolves.toBe(true);
    });

    test("should resolve false for SVG files with script tags", async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(
        '<svg><script>alert("XSS")</script></svg>'
      );

      const file: formidable.File = {
        originalFilename: "test.svg",
        mimetype: "image/svg+xml",
      } as formidable.File;

      await expect(isUploadFileSafe(file)).resolves.toBe(false);
    });
  });
});
