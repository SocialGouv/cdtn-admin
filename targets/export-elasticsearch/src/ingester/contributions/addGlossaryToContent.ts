import { ContributionContent } from "@socialgouv/cdtn-types";

export function addGlossaryToContent(
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
    };
  }
}
