import {
  DocumentElasticWithSource,
  EditorialContentDoc,
  InfographicTemplateDoc
} from "@socialgouv/cdtn-types";
import { getRelatedIdsDocuments } from "./getRelatedIdsDocuments";

interface Return {
  documents: DocumentElasticWithSource<EditorialContentDoc>[];
  relatedIdsDocuments: string[];
}

export const generateEditorialContents = (
  documents: DocumentElasticWithSource<EditorialContentDoc>[],
  infographics: DocumentElasticWithSource<InfographicTemplateDoc>[]
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
          if (block.type === "graphic") {
            const infographic = infographics.find(
              (info) => info.id === block.infographic_id
            );
            if (!infographic) {
              throw new Error(
                `No infographic found for information page ${document.title}/${document.cdtnId} (block: ${block.infographic_id})`
              );
            }
            return {
              ...block,
              size: infographic.pdfFilesizeOctet,
              type: "graphic",
              imgUrl: infographic.svgFilename,
              altText: infographic.title,
              fileUrl: infographic.pdfFilename,
              html: infographic.transcription,
              slug: infographic.slug
            };
          }
          return {
            ...block,
            html: htmlWithGlossary
          };
        });
        return content;
      })
    };
  });
  const relatedIdsDocuments = getRelatedIdsDocuments(documentsOptimized);
  return {
    documents: documentsOptimized,
    relatedIdsDocuments
  };
};
