import type { DocumentReference } from "@shared/types";
import type DilaApiClient from "@socialgouv/dila-api-client";
import type { ArticleVersion } from "./types";
declare function createGetArticleReference(client: DilaApiClient): (id: string) => Promise<DocumentReference | null>;
declare function getLatestVersion(articleVersions: ArticleVersion[]): ArticleVersion;
declare function extractArticleId(url: string): string[];
export { createGetArticleReference, extractArticleId, getLatestVersion };
