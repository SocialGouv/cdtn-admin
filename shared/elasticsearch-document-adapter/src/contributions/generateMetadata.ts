import { ContributionDocumentJson } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { isGenericContribution } from "./helpers";
import { ContributionContent, ContributionMetadata } from "./types";

export const generateMetadata = (
  contribution: DocumentElasticWithSource<ContributionDocumentJson>,
  content: ContributionContent
): ContributionMetadata => {
  let contentOrDescription = "";

  if ("ficheSpDescription" in content) {
    contentOrDescription = content.ficheSpDescription;
  } else {
    contentOrDescription = content.content;
  }

  const title = contribution.questionName;

  const contentSliced =
    contentOrDescription.length > 150
      ? contentOrDescription.slice(0, contentOrDescription.indexOf(" ", 150)) +
        "…"
      : contentOrDescription;

  return {
    title,
    description: contentSliced,
    text: isGenericContribution(contribution)
      ? contentSliced
      : `${contribution.idcc} ${title}`,
  };
};
