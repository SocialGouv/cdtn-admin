import {
  ContributionRef,
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";
import { isReferencingGenericContribution } from "./helpers";

export const generateReferences = (
  contribGeneric:
    | DocumentElasticWithSource<ContributionDocumentJson>
    | undefined,
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
): ContributionRef[] => {
  if (isReferencingGenericContribution(contrib.contentType)) {
    if (!contribGeneric) {
      throw new Error(
        `Aucune contribution générique a été retrouvée pour la question ${contrib.questionIndex}`
      );
    }
    if (contribGeneric.type === "generic-no-cdt") {
      throw new Error(
        `La contribution [${contrib.questionIndex} - ${contrib.idcc}] ne peut pas référencer une générique qui n'a pas de réponse`
      );
    }
    const result = [...contrib.references, ...contribGeneric.references];
    return removeDuplicates(result);
  }
  return contrib.references;
};

const removeDuplicates = (array: ContributionRef[]) => {
  return array.filter(
    (v, i) => array.findIndex((v2) => v2.url === v.url) === i
  );
};
