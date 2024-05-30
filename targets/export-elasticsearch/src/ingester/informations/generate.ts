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
  const relatedIdsDocuments = getRelatedIdsDocuments(documents);
  return {
    documents,
    relatedIdsDocuments,
  };
};
