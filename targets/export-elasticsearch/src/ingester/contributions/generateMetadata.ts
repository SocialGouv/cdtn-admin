import {
  ContributionDocumentJson,
  ContributionMetadata,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";
import { format } from "date-fns";
import frLocale from "date-fns/locale/fr";

export const generateMetadata = (
  contribution: DocumentElasticWithSource<ContributionDocumentJson>
): ContributionMetadata => {
  return {
    title: contribution.questionName,
    date: format(contribution.updated_at, "dd/MM/yyyy", {
      locale: frLocale,
    }),
    text: contribution.description, // champ qui est indexé par elasticsearch
  };
};
