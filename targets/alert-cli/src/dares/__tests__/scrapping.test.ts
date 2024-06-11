import axios from "axios";
import { extractDaresXlsxFromMT } from "../scrapping";
import fs from "fs";
import path from "path";

jest.mock("axios");

describe("extractXlsxFromUrl", () => {
  it("should extract xlsx file from url", async () => {
    const html = `
      <html>
        <head>
          <base href="https://www.domain.com" />
        </head>
        <body>
          <a href="file1.xlsx">File 1</a>
          <a href="file2.xlsx">File 2</a>
        </body>
      </html>
    `;
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: html });
    const result = await extractDaresXlsxFromMT();
    expect(result).toBe("https://www.domain.com/file1.xlsx");
  });

  it("should throw error if xlsx file is present but url is relative with base tag", async () => {
    const html = `
      <html>
        <body>
          <a href="file1.xlsx">File 1</a>
          <a href="file2.xlsx">File 2</a>
        </body>
      </html>
    `;
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: html });
    await expect(extractDaresXlsxFromMT()).rejects.toThrow(
      "xlsx file url not valid : file1.xlsx"
    );
  });

  it("should throw error if no xlsx file found", async () => {
    const html = `
      <html>
        <body>
          <a href="file1.pdf">File 1</a>
        </body>
      </html>
    `;
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: html });
    await expect(extractDaresXlsxFromMT()).rejects.toThrow(
      "No xlsx file found"
    );
  });

  it("should work with a real dares html page", async () => {
    const html = fs
      .readFileSync(path.join(__dirname, "../__mocks__/page_dares.html"))
      .toString();

    (axios.get as jest.Mock).mockResolvedValueOnce({ data: html });
    const result = await extractDaresXlsxFromMT();
    expect(result).toBe(
      "https://travail-emploi.gouv.fr//IMG/xlsx/dares_donnes_identifiant_convention_collective_avril24.xlsx"
    );
  });
});
