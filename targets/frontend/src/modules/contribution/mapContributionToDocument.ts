import { ContributionsAnswers } from "@shared/types";
import { Document } from "../documents/type";
import { SOURCES } from "@socialgouv/cdtn-sources";

type ContributionDocument = {};

export const mapContributionToDocument = (
  data: ContributionsAnswers,
  document: Document<ContributionDocument>
): Document<ContributionDocument> => {
  return {
    cdtn_id: document.cdtn_id,
    initial_id: document.initial_id, // TODO: A voir si on le bouge ou pas
    source: SOURCES.CONTRIBUTIONS,
    meta_description: document.meta_description,
    title: document.title,
    text: document.text,
    slug: document.slug,
    is_available: true,
    document: {},
  };
};
