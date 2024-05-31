import { SOURCES } from "@socialgouv/cdtn-sources";
import { fetchDocumentBySource } from "./fetchDocumentBySource";
import {
  addGlossaryContentToMarkdown,
  fetchGlossary,
  logger,
} from "@shared/utils";
import { updateDocument } from "./updateDocument";

export const updateEditorialContentDocumentsGlossary = async () => {
  const glossary = await fetchGlossary();
  const editorialContents = await fetchDocumentBySource(
    SOURCES.EDITORIAL_CONTENT
  );
  logger.info(`Found ${editorialContents.length} editorial contents`);
  for (let i = 0; i < editorialContents.length; i++) {
    const document = editorialContents[i].document;
    await updateDocument(editorialContents[i].cdtn_id, {
      ...document,
      introWithGlossary: addGlossaryContentToMarkdown(
        glossary,
        document.intro ?? ""
      ),
      contents: document.contents.map((content: any) => {
        return {
          ...content,
          blocks: content.blocks.map((block: any) => {
            if ("markdown" in block) {
              return {
                ...block,
                htmlWithGlossary: addGlossaryContentToMarkdown(
                  glossary,
                  block.markdown
                ),
              };
            }
            return block;
          }),
        };
      }),
    });
    logger.info(
      `Updated editorial content ${i + 1}/${
        editorialContents.length
      } with glossary`
    );
  }
};
