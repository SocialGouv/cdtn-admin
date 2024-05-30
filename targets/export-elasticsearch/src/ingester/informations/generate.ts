import {
  DocumentElasticWithSource,
  EditorialContentDoc,
} from "@socialgouv/cdtn-types";
import { markdownTransform } from "./markdown";
import { getRelatedIdsDocuments } from "./getRelatedIdsDocuments";

interface Return {
  documents: DocumentElasticWithSource<EditorialContentDoc>[];
  relatedIdsDocuments: string[];
}

export const generateEditorialContents = (
  documents: DocumentElasticWithSource<EditorialContentDoc>[]
): Return => {
  const documentsMarkdownified = markdownTransform(documents);
  const relatedIdsDocuments = getRelatedIdsDocuments(documentsMarkdownified);
  return {
    documents: documentsMarkdownified,
    relatedIdsDocuments,
  };
};
