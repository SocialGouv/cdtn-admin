import {
  ContributionContent,
  ContributionDocumentJson,
  ContributionMetadata,
  DocumentElasticWithSource,
} from "@shared/types";
import { isGenericContribution } from "./helpers";

const toText = (html: string): string => {
  return html
    .replace(/(<[^>]*>?)|(&nbsp;)/gm, " ")
    .replace(/[ ]{2,}/gm, " ")
    .trim();
};

const first150 = (text: string): string => {
  return text.length > 150 ? text.slice(0, text.indexOf(" ", 149)) + "…" : text;
};

export const generateMetadata = (
  contribution: DocumentElasticWithSource<ContributionDocumentJson>,
  content: ContributionContent
): ContributionMetadata => {
  const contentOrDescription =
    "ficheSpDescription" in content
      ? content.ficheSpDescription
      : "messageBlockGenericNoCDT" in content
      ? content.messageBlockGenericNoCDT
      : content.content;

  const title = contribution.questionName;
  const contentSliced = first150(toText(contentOrDescription));

  return {
    title,
    description: contentSliced,
    text: isGenericContribution(contribution)
      ? contentSliced
      : `${contribution.idcc} ${title}`,
  };
};
