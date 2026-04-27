import { htmlToText as convert } from "html-to-text";

export function htmlToText(html: string): string {
  return convert(html, {
    selectors: [
      { options: { ignoreHref: true }, selector: "a" },
      { format: "skip", selector: "img" },
    ],
    wordwrap: false,
  })
    .trim()
    .replace(/^\s*\n/gm, "\n") as string;
}
