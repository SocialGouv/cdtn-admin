import type { EditorialContentDoc } from "@shared/types";
import { logger } from "@socialgouv/cdtn-logger";
import type { SourceValues } from "@socialgouv/cdtn-sources";
import { SOURCES } from "@socialgouv/cdtn-sources";

import type { GetBreadcrumbsFn } from "../breadcrumbs";
import { getDocumentBySource } from "../fetchCdtnAdminDocuments";
import type { AddGlossaryReturnFn } from "../glossary";
import { markdownTransform } from "../markdown";

export type EditorialContent = {
  documents: unknown;
  source: SourceValues;
};

export const mapEditorialContent = async (
  addGlossary: AddGlossaryReturnFn,
  getBreadcrumbs: GetBreadcrumbsFn
): Promise<EditorialContent> => {
  logger.info("=== Editorial contents ===");
  const start = process.hrtime();
  const documents = await getDocumentBySource(
    SOURCES.EDITORIAL_CONTENT,
    getBreadcrumbs
  );
  const data = {
    documents: markdownTransform(
      addGlossary,
      documents as unknown as EditorialContentDoc[]
    ),
    source: SOURCES.EDITORIAL_CONTENT,
  };
  const end = process.hrtime(start);
  logger.info(`=== Editorial contents in ${end[1] / 1000000}ms ===`);
  return data;
};
