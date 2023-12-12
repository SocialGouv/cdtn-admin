import {
  ContributionContent,
  ContributionDocumentJson,
  ContributionMetadata,
  DocumentElasticWithSource,
} from "@shared/types";
import { isGenericContribution } from "./helpers";

const HTML_TAGS = /<[^>]*>?/gm;
const toText = (html: string): string => {
  return html
    .slice(0, 250)
    .replace(HTML_TAGS, "")
    .replace(/&nbsp;/gm, " ");
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
