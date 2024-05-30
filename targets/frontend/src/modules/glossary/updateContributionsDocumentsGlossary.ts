import { SOURCES } from "@socialgouv/cdtn-sources";
import { fetchDocumentBySource } from "./fetchDocumentBySource";
import { addGlossaryContent, fetchGlossary } from "@shared/utils";
import { updateDocument } from "./updateDocument";

export const updateContributionsDocumentsGlossary = async () => {
  const glossary = await fetchGlossary();
  const contributions = await fetchDocumentBySource(SOURCES.CONTRIBUTIONS);
  for (const contribution of contributions) {
    const document = contribution.document;
    if (document.content_type === "ANSWER") {
      const contentWithGlossary = addGlossaryContent(
        glossary,
        document.content ?? ""
      );
      await updateDocument(contribution.cdtn_id, {
        ...document,
        contentWithGlossary,
      });
    }
  }
};
