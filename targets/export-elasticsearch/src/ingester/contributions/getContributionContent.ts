import { ContributionContent } from "@socialgouv/cdtn-types";
import { htmlToText } from "../utils/textConverter";

export function getContributionContent(
  content: ContributionContent
): ContributionContent {
  if (
    "ficheSpDescription" in content ||
    "messageBlockGenericNoCDT" in content
  ) {
    return content;
  } else {
    return {
      content: content.content,
      infographics: content.infographics,
    };
  }
}

export function getContributionText(
  content: ContributionContent,
  description: string
): string {
  if ("content" in content) {
    return htmlToText(content.content as string);
  } else {
    return description;
  }
}
