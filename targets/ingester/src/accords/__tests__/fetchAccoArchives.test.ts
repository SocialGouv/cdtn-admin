import { beforeEach, describe, expect, test } from "@jest/globals";
import got from "got";

import { ACCO_INDEX_URL, fetchAccoArchives } from "../fetchAccoArchives";

jest.mock("got", () => ({ __esModule: true, default: jest.fn() }));

const mockedGot = got as unknown as jest.MockedFunction<typeof got>;

// Extrait représentatif de la page d'index Apache de la DILA :
// https://echanges.dila.gouv.fr/OPENDATA/ACCO/
const INDEX_HTML = `<html>
 <head><title>Index of /OPENDATA/ACCO</title></head>
 <body>
<h1>Index of /OPENDATA/ACCO</h1>
<pre>      <a href="?C=N;O=D">Name</a>                    <a href="?C=M;O=A">Last modified</a>      <a href="?C=S;O=A">Size</a>
<hr>
<img src="/icons/back.gif" alt="[PARENTDIR]"> <a href="/OPENDATA/">Parent Directory</a>                             -
<img src="/icons/pdf.gif" alt="[   ]"> <a href="%20DILA_ACCO_Presentation_20171212.pdf">DILA_ACCO_Presentation_20171212.pdf</a> 08-Dec-2017 12:00  233K
<img src="/icons/compressed.gif" alt="[   ]"> <a href="ACCO_20250708-061500.tar.gz">ACCO_20250708-061500.tar.gz</a>  08-Jul-2025 06:15   16M
<img src="/icons/compressed.gif" alt="[   ]"> <a href="Freemium_acco_global_20250713-140000.tar.gz">Freemium_acco_global_20250713-140000.tar.gz</a> 13-Jul-2025 14:00   45G
<img src="/icons/compressed.gif" alt="[   ]"> <a href="ACCO_20260206-180417.tar.gz">ACCO_20260206-180417.tar.gz</a>  06-Feb-2026 18:04   279
<img src="/icons/compressed.gif" alt="[   ]"> <a href="ACCO_20260629-064356.tar.gz">ACCO_20260629-064356.tar.gz</a>  29-Jun-2026 06:43   58M
<img src="/icons/compressed.gif" alt="[   ]"> <a href="notes.tar.gz">notes.tar.gz</a>  01-Jan-2026 00:00   1K
<hr></pre>
</body></html>`;

function mockIndex(html: string) {
  mockedGot.mockReturnValue({
    text: jest.fn().mockResolvedValue(html),
  } as never);
}

describe("fetchAccoArchives", () => {
  beforeEach(() => {
    mockIndex(INDEX_HTML);
  });

  test("interroge l'index DILA par défaut", async () => {
    await fetchAccoArchives();
    expect(mockedGot).toHaveBeenCalledWith(ACCO_INDEX_URL);
  });

  test("interroge l'URL d'index fournie", async () => {
    const url = "https://example.test/ACCO/";
    await fetchAccoArchives(url);
    expect(mockedGot).toHaveBeenCalledWith(url);
  });

  test("récupère les archives incrémentales ACCO", async () => {
    const archives = await fetchAccoArchives();
    const incremental = archives.filter((a) => a.type === "incremental");
    expect(incremental.map((a) => a.name)).toEqual([
      "ACCO_20250708-061500.tar.gz",
      "ACCO_20260206-180417.tar.gz",
      "ACCO_20260629-064356.tar.gz",
    ]);
  });

  test("identifie l'archive Freemium comme base complète (full)", async () => {
    const archives = await fetchAccoArchives();
    const full = archives.filter((a) => a.type === "full");
    expect(full).toHaveLength(1);
    expect(full[0].name).toBe("Freemium_acco_global_20250713-140000.tar.gz");
  });

  test("construit des URLs absolues à partir de l'index", async () => {
    const archives = await fetchAccoArchives();
    const archive = archives.find(
      (a) => a.name === "ACCO_20260629-064356.tar.gz"
    );
    expect(archive?.url).toBe(
      "https://echanges.dila.gouv.fr/OPENDATA/ACCO/ACCO_20260629-064356.tar.gz"
    );
  });

  test("extrait la date (UTC) depuis le nom de fichier", async () => {
    const archives = await fetchAccoArchives();
    const archive = archives.find(
      (a) => a.name === "ACCO_20260629-064356.tar.gz"
    );
    expect(archive?.date.toISOString()).toBe("2026-06-29T06:43:56.000Z");
  });

  test("inclut les archives même de très petite taille (potentiellement corrompues)", async () => {
    const archives = await fetchAccoArchives();
    expect(archives.map((a) => a.name)).toContain(
      "ACCO_20260206-180417.tar.gz"
    );
  });

  test("ignore les fichiers non archivés (PDF, lien parent)", async () => {
    const archives = await fetchAccoArchives();
    const names = archives.map((a) => a.name);
    expect(names).not.toContain("DILA_ACCO_Presentation_20171212.pdf");
    expect(names.every((name) => name.endsWith(".tar.gz"))).toBe(true);
  });

  test("ignore les .tar.gz ne respectant pas la convention de nommage ACCO", async () => {
    const archives = await fetchAccoArchives();
    expect(archives.map((a) => a.name)).not.toContain("notes.tar.gz");
  });

  test("retourne un tableau vide si l'index ne liste aucune archive", async () => {
    mockIndex("<html><body>Aucune archive</body></html>");
    const archives = await fetchAccoArchives();
    expect(archives).toEqual([]);
  });
});
