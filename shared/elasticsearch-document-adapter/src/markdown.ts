import type { EditorialContentDoc } from "@shared/types";
import htmlAstToAnotherHtmlAst from "rehype-raw";
import htmlAstStringify from "rehype-stringify";
import markdownToMardownAst from "remark-parse";
import markdownAstToHtmlAst from "remark-rehype";
import unified from "unified";

const htmlProcessor = unified()
  .use(markdownToMardownAst)
  .use(markdownAstToHtmlAst, { allowDangerousHtml: true })
  .use(htmlAstToAnotherHtmlAst)
  .use(htmlAstStringify);

export function markdownTransform(
  addGlossary: any,
  documents: EditorialContentDoc[]
) {
  return documents.map(({ contents = [], ...rest }) => ({
    ...rest,
    contents: contents.map((content) => {
      content.blocks = content.blocks.map((block) => {
        return {
          ...block,
          html: addGlossary(htmlProcessor.processSync(block.markdown).contents),
        };
      });
      return content;
    }),
    intro: addGlossary(htmlProcessor.processSync(rest.intro).contents),
  }));
}
