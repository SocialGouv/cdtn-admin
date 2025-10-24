/**
 * Extract article IDs from Legifrance URLs.
 * Supports multiple URL formats and article types:
 * - KALIARTI: Convention collective articles
 * - LEGIARTI: Code du travail articles
 *
 * URL formats:
 * - Query parameter: ?idArticle=KALIARTI...
 * - Path segment: /article/KALIARTI... or /article_lc/LEGIARTI...
 * - Path segment: /conv_coll/id/KALIARTI...
 * - Hash fragment: #KALIARTI... or #LEGIARTI...
 */
export function extractArticleId(url: string): string[] {
  if (!url || typeof url !== "string") {
    return [];
  }

  // Try to extract from idArticle query parameter first (highest priority)
  const idArticleMatch = url.match(
    /[?&]idArticle=((?:KALI|LEGI)ARTI[A-Z0-9]+)/
  );
  if (idArticleMatch) {
    return [idArticleMatch[1]];
  }

  // Try to extract from hash fragment (check for article ID specifically)
  const hashMatch = url.match(/#((?:KALI|LEGI)ARTI[A-Z0-9]+)$/);
  if (hashMatch) {
    return [hashMatch[1]];
  }

  // Try to extract from /article/ or /article_lc/ path
  const articlePathMatch = url.match(
    /\/article(?:_lc)?\/((?:KALI|LEGI)ARTI[A-Z0-9]+)/
  );
  if (articlePathMatch) {
    return [articlePathMatch[1]];
  }

  // Try to extract from /conv_coll/id/ path (only for KALIARTI)
  const idPathMatch = url.match(/\/conv_coll\/id\/(KALIARTI[A-Z0-9]+)/);
  if (idPathMatch) {
    return [idPathMatch[1]];
  }

  // Try to extract from /codes/article_lc/ path (for LEGIARTI)
  const codesPathMatch = url.match(/\/codes\/article_lc\/(LEGIARTI[A-Z0-9]+)/);
  if (codesPathMatch) {
    return [codesPathMatch[1]];
  }

  return [];
}
