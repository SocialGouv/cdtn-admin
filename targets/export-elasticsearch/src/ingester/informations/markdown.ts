import type {
  DocumentElasticWithSource,
  EditorialContentDoc,
} from "@socialgouv/cdtn-types";
import htmlAstToAnotherHtmlAst from "rehype-raw";
import htmlAstStringify from "rehype-stringify";
import markdownToMardownAst from "remark-parse";
import markdownAstToHtmlAst from "remark-rehype";
import unified from "unified";

const htmlProcessor = unified()
  .use(markdownToMardownAst as any)
  .use(markdownAstToHtmlAst as any, { allowDangerousHtml: true })
  .use(htmlAstToAnotherHtmlAst as any)
  .use(htmlAstStringify as any);

export function markdownTransform(
  documents: DocumentElasticWithSource<EditorialContentDoc>[]
): DocumentElasticWithSource<EditorialContentDoc>[] {
  return documents.map(({ contents = [], ...rest }) => ({
    ...rest,
    contents: contents.map((content) => {
      content.blocks = content.blocks.map((block: any) => {
        return {
          ...block,
          html: block.markdown
            ? (htmlProcessor.processSync(block.markdown).contents as string)
            : undefined,
        };
      });
      return content;
    }),
    intro: htmlProcessor.processSync(rest.intro).contents as string,
  }));
}
