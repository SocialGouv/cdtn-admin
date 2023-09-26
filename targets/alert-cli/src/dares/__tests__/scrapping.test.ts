import axios from "axios";
import { extractXlsxFromUrl } from "../scrapping";

jest.mock("axios");

describe("extractXlsxFromUrl", () => {
  it("should extract xlsx file from url", async () => {
    const url = "https://example.com/files";
    const html = `
      <html>
        <body>
          <a href="file1.xlsx">File 1</a>
          <a href="file2.xlsx">File 2</a>
        </body>
      </html>
    `;
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: html });
    const result = await extractXlsxFromUrl(url);
    expect(result).toBe("file1.xlsx");
  });

  it("should throw error if no xlsx file found", async () => {
    const url = "https://example.com/files";
    const html = `
      <html>
        <body>
          <a href="file1.pdf">File 1</a>
        </body>
      </html>
    `;
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: html });
    await expect(extractXlsxFromUrl(url)).rejects.toThrow("No xlsx file found");
  });
});
