import { extractArticleId } from "../extractArticleId";

describe("extractArticleId", () => {
  it("should extract article ID from old format URL with idArticle parameter", () => {
    const url =
      "https://www.legifrance.gouv.fr/affichIDCCArticle.do;jsessionid=9D32D1AB24BC5ACF016410CDFEE667F3.tplgfr24s_3?idArticle=KALIARTI000005849509&cidTexte=KALITEXT000005678903&dateTexte=29990101&categorieLien=id";

    expect(extractArticleId(url)).toEqual(["KALIARTI000005849509"]);
  });

  it("should extract article ID from new format URL with /article/ path", () => {
    const url =
      "https://www.legifrance.gouv.fr/conv_coll/article/KALIARTI000005849570?idConteneur=KALICONT000005635624";

    expect(extractArticleId(url)).toEqual(["KALIARTI000005849570"]);
  });

  it("should extract article ID from URL with hash fragment", () => {
    const url =
      "https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000005678903#KALIARTI000005849509";

    expect(extractArticleId(url)).toEqual(["KALIARTI000005849509"]);
  });

  it("should return empty array for URL without article ID", () => {
    const url = "https://www.legifrance.gouv.fr/some/other/path";

    expect(extractArticleId(url)).toEqual([]);
  });

  it("should handle empty string", () => {
    expect(extractArticleId("")).toEqual([]);
  });

  it("should handle malformed URLs gracefully", () => {
    expect(extractArticleId("not-a-url")).toEqual([]);
  });

  it("should extract from /conv_coll/id/ format", () => {
    const url =
      "https://www.legifrance.gouv.fr/conv_coll/id/KALIARTI000046093607";

    expect(extractArticleId(url)).toEqual(["KALIARTI000046093607"]);
  });

  it("should prioritize idArticle parameter over path", () => {
    const url =
      "https://www.legifrance.gouv.fr/article/KALIARTI111111?idArticle=KALIARTI000005849509";

    expect(extractArticleId(url)).toEqual(["KALIARTI000005849509"]);
  });

  it("should extract LEGIARTI from Code du travail URL with article_lc", () => {
    const url =
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901180/2008-05-01";

    expect(extractArticleId(url)).toEqual(["LEGIARTI000006901180"]);
  });

  it("should extract LEGIARTI from Code du travail URL without date", () => {
    const url =
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901112";

    expect(extractArticleId(url)).toEqual(["LEGIARTI000006901112"]);
  });

  it("should extract LEGIARTI from hash fragment", () => {
    const url =
      "https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006072050#LEGIARTI000006901180";

    expect(extractArticleId(url)).toEqual(["LEGIARTI000006901180"]);
  });

  it("should handle both KALIARTI and LEGIARTI in idArticle parameter", () => {
    const kaliUrl =
      "https://www.legifrance.gouv.fr/affichIDCCArticle.do?idArticle=KALIARTI000005849509";
    const legiUrl =
      "https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=LEGIARTI000006901180";

    expect(extractArticleId(kaliUrl)).toEqual(["KALIARTI000005849509"]);
    expect(extractArticleId(legiUrl)).toEqual(["LEGIARTI000006901180"]);
  });
});
