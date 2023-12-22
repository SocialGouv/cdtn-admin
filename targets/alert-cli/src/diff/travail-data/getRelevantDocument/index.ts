import type {
  DocumentInfoWithCdtnRef,
  TravailDataChanges,
} from "@shared/types";
import { getRelevantMtDocumentsThemeAndPrequalified } from "./themesAndPrequalified";
import { getRelevantMtDocumentsContributions } from "./contributions";

export async function getRelevantMtDocuments({
  modified,
  removed,
}: Pick<TravailDataChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const themeAndPrequalifiedDocs =
    await getRelevantMtDocumentsThemeAndPrequalified({ modified, removed });
  const contributions = await getRelevantMtDocumentsContributions({
    modified,
    removed,
  });
  return [...themeAndPrequalifiedDocs, ...contributions];
}
