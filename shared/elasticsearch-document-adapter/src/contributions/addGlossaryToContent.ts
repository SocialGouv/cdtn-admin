import { ContributionContent } from "@shared/types";

export function addGlossaryToContent(
  content: ContributionContent,
  addGlossary: (valueInHtml: string) => string
): ContributionContent {
  if ("ficheSpDescription" in content) {
    return content;
  } else {
    return {
      content: addGlossary(content.content),
    };
  }
}
