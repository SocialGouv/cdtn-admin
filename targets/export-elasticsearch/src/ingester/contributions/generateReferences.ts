import {
  ContributionRef,
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@shared/types";
import { isReferencingGenericContribution } from "./helpers";

export const generateReferences = (
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
): ContributionRef[] => {
  if (isReferencingGenericContribution(contrib.contentType)) {
    const cdtContrib = contributions.find(
      (v) => v.questionIndex === contrib.questionIndex && v.idcc === "0000"
    );
    if (!cdtContrib) {
      throw new Error(
        `Aucune contribution générique a été retrouvée pour la question ${contrib.questionIndex}`
      );
    }
    if (cdtContrib.type === "generic-no-cdt") {
      throw new Error(
        `La contribution [${contrib.questionIndex} - ${contrib.idcc}] ne peut pas être de type "Code du travail" parce que la générique n'a pas de réponse`
      );
    }
    const result = [...contrib.references, ...cdtContrib.references];
    return removeDuplicates(result);
  }
  return contrib.references;
};

const removeDuplicates = (array: ContributionRef[]) => {
  return array.filter(
    (v, i) => array.findIndex((v2) => v2.url === v.url) === i
  );
};
