import type { EditorialContentDoc, EditorialContentPart } from "@shared/types";
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

function mapBlocks(
  blocks: EditorialContentPart[],
  times: number[],
  addGlossary: AddGlossaryReturnFn
): EditorialContentPart[] {
  const computedBlocks = blocks.map((block: any) => {
    const contentStart = process.hrtime();
    const contents = htmlProcessor.processSync(block.markdown)
      .contents as string;
    const contentEnd = process.hrtime(contentStart);
    times.push(Math.round(contentEnd[0] * 1000 + contentEnd[1] / 1000000));
    const html = block.markdown ? addGlossary(contents) : undefined;
    times.push(html?.duration ?? 0);
    return {
      ...block,
      html: html?.result,
    };
  });
  return computedBlocks;
}

export function markdownTransform(
  addGlossary: AddGlossaryReturnFn,
  documents: EditorialContentDoc[]
) {
  const times: number[] = [];
  const docs = documents.map(({ contents = [], ...rest }) => {
    const intro = addGlossary(
      htmlProcessor.processSync(rest.intro).contents as string
    );
    times.push(intro.duration ?? 0);
    return {
      ...rest,
      contents: contents.map((content) => ({
        ...content,
        blocks: mapBlocks(content.blocks, times, addGlossary),
      })),
      intro: intro.result,
    };
  });
  logger.info(
    `Average glossary: ${
      times.reduce((total, current) => total + current, 0) / times.length
    } ms`
  );
  logger.info(
    `Total glossary: ${times.reduce((total, current) => total + current, 0)} ms`
  );

  return docs;
}
