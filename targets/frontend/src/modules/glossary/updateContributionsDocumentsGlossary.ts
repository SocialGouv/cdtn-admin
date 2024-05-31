import { SOURCES } from "@socialgouv/cdtn-sources";
import { fetchDocumentBySource } from "./fetchDocumentBySource";
import { addGlossaryContent, fetchGlossary } from "@shared/utils";
import { updateDocument } from "./updateDocument";
import { logger } from "@shared/utils";

export const updateContributionsDocumentsGlossary = async () => {
  const glossary = await fetchGlossary();
  const contributions = await fetchDocumentBySource(SOURCES.CONTRIBUTIONS);
  logger.info(`Found ${contributions.length} contributions`);
  for (let i = 0; i < contributions.length; i++) {
    const document = contributions[i].document;
    if (document.contentType === "ANSWER") {
      const contentWithGlossary = addGlossaryContent(
        glossary,
        document.content ?? ""
      );
      await updateDocument(contributions[i].cdtn_id, {
        ...document,
        contentWithGlossary,
      });
      logger.info(
        `Updated contribution ${i + 1}/${contributions.length} with glossary`
      );
    }
  }
};
