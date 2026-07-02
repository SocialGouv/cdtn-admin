import axios from "axios";
import { extractDaresXlsxFromMT } from "../scrapping";
import fs from "fs";
import path from "path";

jest.mock("axios");

describe("extractDaresXlsxFromMT", () => {
  it("should extract xlsx file from url", async () => {
    const html = `
      <html>
        <body>
          <a href="file1.xlsx">File 1</a>
          <a href="file2.xlsx">File 2</a>
        </body>
      </html>
    `;
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: html });
    const result = await extractDaresXlsxFromMT();
    expect(result).toBe("https://travail-emploi.gouv.fr/file1.xlsx");
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

  it("should pick the DARES file when several xlsx links are present", async () => {
    const html = `
      <html>
        <body>
          <a href="/sites/travail-emploi/files/2025-12/Grille_de_classification_et_conventions_collectives_2025.xlsx">Grille</a>
          <a href="/sites/travail-emploi/files/2026-06/Dares_Suivi_Historique_convention_collective_Juin2026.xlsx">DARES</a>
        </body>
      </html>
    `;
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: html });
    const result = await extractDaresXlsxFromMT();
    expect(result).toBe(
      "https://travail-emploi.gouv.fr/sites/travail-emploi/files/2026-06/Dares_Suivi_Historique_convention_collective_Juin2026.xlsx"
    );
  });

  it("should work with a real dares html page", async () => {
    const html = fs
      .readFileSync(path.join(__dirname, "../__mocks__/page_dares.html"))
      .toString();

    (axios.get as jest.Mock).mockResolvedValueOnce({ data: html });
    const result = await extractDaresXlsxFromMT();
    expect(result).toBe(
      "https://travail-emploi.gouv.fr/sites/travail-emploi/files/2026-06/Dares_Suivi_Historique_convention_collective_Juin2026.xlsx"
    );
  });
});
