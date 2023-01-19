import type { EditorialContentDoc } from "@shared/types";
import { logger } from "@socialgouv/cdtn-logger";
import htmlAstToAnotherHtmlAst from "rehype-raw";
import htmlAstStringify from "rehype-stringify";
import markdownToMardownAst from "remark-parse";
import markdownAstToHtmlAst from "remark-rehype";
import unified from "unified";

import type { AddGlossaryReturnFn } from "./glossary";

const htmlProcessor = unified()
  .use(markdownToMardownAst)
  .use(markdownAstToHtmlAst, { allowDangerousHtml: true })
  .use(htmlAstToAnotherHtmlAst)
  .use(htmlAstStringify);

export function markdownTransform(
  addGlossary: AddGlossaryReturnFn,
  documents: EditorialContentDoc[]
) {
  const times: number[] = [];
  const docs = documents.map(({ contents = [], ...rest }) => {
    const intro = addGlossary(
      htmlProcessor.processSync(rest.intro).contents as string
    );
    return {
      ...rest,
      contents: contents.map((content) => {
        content.blocks = content.blocks.map((block: any) => {
          const html = block.markdown
            ? addGlossary(
                htmlProcessor.processSync(block.markdown).contents as string
              )
            : undefined;
          times.push(html?.duration ?? 0);
          return {
            ...block,
            html: html?.result,
          };
        });
        return content;
      }),
      intro: intro.result,
    };
  });
  logger.info(
    `Average glossary: ${
      times.reduce((total, current) => total + current, 0) / times.length
    } ms`
  );
  return docs;
}
