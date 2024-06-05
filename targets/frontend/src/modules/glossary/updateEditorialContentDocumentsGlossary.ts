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
    const introWithGlossary = await addGlossaryContentToMarkdown(
      glossary,
      document.intro ?? ""
    );
    await updateDocument(editorialContents[i].cdtn_id, {
      ...document,
      introWithGlossary,
      contents: await Promise.all(
        document.contents.map(async (content: any) => {
          return {
            ...content,
            blocks: await Promise.all(
              content.blocks.map(async (block: any) => {
                if ("markdown" in block) {
                  const htmlWithGlossary = await addGlossaryContentToMarkdown(
                    glossary,
                    block.markdown
                  );
                  return {
                    ...block,
                    htmlWithGlossary,
                  };
                }
                return block;
              })
            ),
          };
        })
      ),
    });
    logger.info(
      `Updated editorial content ${i + 1}/${
        editorialContents.length
      } with glossary`
    );
  }
};
