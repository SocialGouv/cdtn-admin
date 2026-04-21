import { ContributionContent } from "@socialgouv/cdtn-types";
import { convert } from "html-to-text";

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
    return convert(content.content, {
      selectors: [
        { options: { ignoreHref: true }, selector: "a" },
        { format: "skip", selector: "img" },
      ],
      wordwrap: false,
    })
      .trim()
      .replace(/^\s*\n/gm, "\n");
  } else {
    return description;
  }
}
