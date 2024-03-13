import { DocumentElasticWithSource, EditorialContentDoc } from "@shared/types";
import { markdownTransform } from "./markdown";
import { getContentBlockIds } from "./getContentBlockIds";

export const generateInformations = async (
  documents: DocumentElasticWithSource<EditorialContentDoc>[],
  addGlossary: (valueInHtml: string) => string
) => {
  const documentsMarkdownified = markdownTransform(addGlossary, documents);
  const docsToExport: DocumentElasticWithSource<EditorialContentDoc>[] = [];

  for (const document of documentsMarkdownified) {
    if (document.contents) {
      const cdtnIdsToFetch = getContentBlockIds(document.contents);

      docsToExport.push({
        ...document,
        relatedIdsDocuments: cdtnIdsToFetch,
      });
    }
  }

  return documentsMarkdownified;
};
