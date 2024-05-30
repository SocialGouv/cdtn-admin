import { SOURCES } from "@socialgouv/cdtn-sources";
import { fetchDocumentBySource } from "./fetchDocumentBySource";
import { addGlossaryContentToMarkdown, fetchGlossary } from "@shared/utils";
import { updateDocument } from "./updateDocument";

export const updateEditorialContentDocumentsGlossary = async () => {
  const glossary = await fetchGlossary();
  const editorialContents = await fetchDocumentBySource(
    SOURCES.EDITORIAL_CONTENT
  );
  for (const editorialContent of editorialContents) {
    const document = editorialContent.document;
    await updateDocument(editorialContent.cdtn_id, {
      ...document,
      introWithGlossary: addGlossaryContentToMarkdown(
        glossary,
        document.intro ?? ""
      ),
      blocks: document.blocks.map((block: any) => {
        if ("markdown" in block) {
          return {
            ...block,
            htmlWithGlossary: addGlossaryContentToMarkdown(
              glossary,
              block.markdown
            ),
          };
        }
        return {
          ...block,
        };
      }),
    });
  }
};
