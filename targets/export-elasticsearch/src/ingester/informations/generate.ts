import {
  DocumentElasticWithSource,
  EditorialContentDoc,
} from "@socialgouv/cdtn-types";
import { getRelatedIdsDocuments } from "./getRelatedIdsDocuments";

interface Return {
  documents: DocumentElasticWithSource<EditorialContentDoc>[];
  relatedIdsDocuments: string[];
}

export const generateEditorialContents = (
  documents: DocumentElasticWithSource<EditorialContentDoc>[]
): Return => {
  const documentsOptimized = documents.map((document: any) => {
    const introWithGlossary = document.introWithGlossary;
    delete document.intro;
    delete document.introWithGlossary;
    return {
      ...document,
      intro: introWithGlossary,
      contents: document.contents.map((content: any) => {
        content.blocks = content.blocks.map((block: any) => {
          const htmlWithGlossary = block.htmlWithGlossary;
          delete block.markdown;
          delete block.htmlWithGlossary;
          return {
            ...block,
            html: htmlWithGlossary,
          };
        });
        return content;
      }),
    };
  });
  const relatedIdsDocuments = getRelatedIdsDocuments(documentsOptimized);
  return {
    documents: documentsOptimized,
    relatedIdsDocuments,
  };
};
