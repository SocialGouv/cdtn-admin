import {
  EditorialContentType,
  DocumentElasticWithSource,
  EditorialContentDoc,
} from "@socialgouv/cdtn-types";
import { RelatedDocuments } from "../common/populateRelatedDocuments";

export const mergeRelatedDocumentsToEditorialContents = (
  editorialContents: DocumentElasticWithSource<EditorialContentDoc>[],
  relatedDocuments: RelatedDocuments
): DocumentElasticWithSource<EditorialContentDoc>[] => {
  return editorialContents.map((document) => {
    const contents = document.contents.map((content) => {
      const blocks = content.blocks.map((block) => {
        if (block.type !== EditorialContentType.content) return block;
        const blockContents = block.contents.flatMap((blockContent) => {
          const contentFound = relatedDocuments[blockContent.cdtnId];
          if (!contentFound) {
            throw new Error(
              `No related document found for ${blockContent.cdtnId}`
            );
          }
          return contentFound;
        });
        return { ...block, contents: blockContents };
      });
      return { ...content, blocks };
    });
    return { ...document, contents };
  });
};
