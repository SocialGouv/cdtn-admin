import type { DocumentInfoWithCdtnRef, VddChanges } from "@shared/types";
import { getRelevantSpDocumentsThemeAndPrequalified } from "./themesAndPrequalified";
import { getRelevantSpDocumentsContributions } from "./contributions";

export async function getRelevantSpDocuments({
  modified,
  removed,
}: Pick<VddChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const themeAndPrequalifiedDocs =
    await getRelevantSpDocumentsThemeAndPrequalified({ modified, removed });
  const contributions = await getRelevantSpDocumentsContributions({
    modified,
    removed,
  });
  return [...themeAndPrequalifiedDocs, ...contributions];
}
