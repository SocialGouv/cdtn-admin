import { htmlToText } from "html-to-text";

const HTML_TO_TEXT_OPTIONS = {
  selectors: [
    { options: { ignoreHref: true }, selector: "a" },
    { format: "skip", selector: "img" },
  ],
  wordwrap: 9999,
};

export default function convertHtmlToPlainText(source: string): string {
  return htmlToText(source, HTML_TO_TEXT_OPTIONS)
    .trim()
    .replace(/\n{3,}/g, "\n\n");
}
