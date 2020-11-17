import htmlAstToAnotherHtmlAst from "rehype-raw";
import htmlAstStringify from "rehype-stringify";
import markdownToMardownAst from "remark-parse";
import markdownAstToHtmlAst from "remark-rehype";
import markdownAstStringify from "remark-stringify";
import markdownAstStrip from "strip-markdown";
import unified from "unified";

import { addGlossary } from "./glossary";

const textProcessor = unified()
  .use(markdownToMardownAst)
  .use(markdownAstStrip)
  .use(markdownAstStringify);

const htmlProcessor = unified()
  .use(markdownToMardownAst)
  .use(markdownAstToHtmlAst, { allowDangerousHtml: true })
  .use(htmlAstToAnotherHtmlAst)
  .use(htmlAstStringify);

export function markdownTransform(glossary, document) {
  document.intro = addGlossary(
    glossary,
    htmlProcessor.processSync(document.intro).contents
  );

  document.contents.forEach((content) => {
    content.html = addGlossary(
      glossary,
      htmlProcessor.processSync(content.markdown).contents
    );
    delete content.markdown;
  });

  document.text =
    textProcessor.processSync(document.intro) +
    document.contents
      .map(({ markdown }) =>
        textProcessor.processSync(markdown).contents.replace(/\s\s+/g, " ")
      )
      .join("");

  return document;
}
