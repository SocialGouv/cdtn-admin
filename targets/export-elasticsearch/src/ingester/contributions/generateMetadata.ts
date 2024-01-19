import {
  ContributionContent,
  ContributionDocumentJson,
  ContributionMetadata,
  DocumentElasticWithSource,
} from "@shared/types";
import { isGenericContribution } from "./helpers";

const HTML_TAGS = "<[^>]*>?";
const NBSP = "&nbsp;";
const MORE_THAN_ONE_WS = "[ ]{2,}";

const toText = (html: string): string => {
  const regexClean = new RegExp(`(${HTML_TAGS})|(${NBSP})`, "gm");
  const regexFindDoubleWS = new RegExp(`${MORE_THAN_ONE_WS}`, "gm");
  return html.replace(regexClean, " ").replace(regexFindDoubleWS, " ").trim();
};

const first150 = (text: string): string => {
  return text.length > 150 ? text.slice(0, text.indexOf(" ", 149)) + "…" : text;
};

export const generateMetadata = (
  contribution: DocumentElasticWithSource<ContributionDocumentJson>,
  content: ContributionContent
): ContributionMetadata => {
  const contentOrDescription =
    contribution.contentType === "GENERIC_NO_CDT"
      ? contribution.description
      : "ficheSpDescription" in content
      ? content.ficheSpDescription
      : "content" in content
      ? content.content
      : "";

  const title = contribution.questionName;
  const contentSliced = first150(toText(contentOrDescription));

  return {
    title,
    text: isGenericContribution(contribution)
      ? contentSliced
      : `${contribution.idcc} ${title}`,
  };
};
