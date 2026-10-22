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
  if (
    contrib.contentType === "ANSWER" &&
    contrib.includedCdtReferences?.length
  ) {
    // CC « Afficher la réponse » : seules les références du Code du travail cochées sont ajoutées
    const included = contrib.includedCdtReferences;
    const genericReferences =
      contribGeneric && contribGeneric.type !== "generic-no-cdt"
        ? contribGeneric.references.filter((ref) => included.includes(ref.url))
        : [];
    return removeDuplicates([...contrib.references, ...genericReferences]);
  }
  return contrib.references;
};

const removeDuplicates = (array: ContributionRef[]) => {
  return array.filter(
    (v, i) => array.findIndex((v2) => v2.url === v.url) === i
  );
};
