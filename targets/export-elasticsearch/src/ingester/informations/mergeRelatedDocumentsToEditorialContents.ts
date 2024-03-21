import {
  CONTENT_TYPE,
  DocumentElasticWithSource,
  EditorialContentDoc,
} from "@shared/types";
import { RelatedDocuments } from "../common/populateRelatedDocuments";

export const mergeRelatedDocumentsToEditorialContents = (
  editorialContents: DocumentElasticWithSource<EditorialContentDoc>[],
  relatedDocuments: RelatedDocuments
): DocumentElasticWithSource<EditorialContentDoc>[] => {
  const augmentedEditorialContents = editorialContents.map((document) => {
    const contents = document.contents.map((content) => {
      const blocks = content.blocks.map((block) => {
        if (block.type !== CONTENT_TYPE.content) return block;
        const contents = block.contents.flatMap((blockContent) => {
          const contentFound = relatedDocuments[blockContent.cdtnId];
          if (!contentFound) {
            throw new Error(
              `No related document found for ${blockContent.cdtnId}`
            );
          }
          return contentFound;
        });
        return { ...block, contents };
      });
      return { ...content, blocks };
    });
    return { ...document, contents };
  });
  return augmentedEditorialContents;
};
