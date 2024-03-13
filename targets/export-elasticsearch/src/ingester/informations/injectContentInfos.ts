import {
  Content,
  ContentType,
  EditorialContentData,
} from "@socialgouv/cdtn-utils";

export const injectContentInfos = (
  contents: Content[],
  fetchedContents: EditorialContentData[]
) => {
  return contents.map((content) => {
    const blocks = content.blocks.map((block) => {
      if (block.type !== ContentType.content) return block;
      const contents = block.contents.flatMap((blockContent) => {
        const contentFound = fetchedContents.find(({ _source }) => {
          return _source.cdtnId === blockContent.cdtnId;
        });
        // delete contentFound?._source.title_vector;
        return contentFound ? [contentFound._source] : [];
      });
      return { ...block, contents };
    });
    return { ...content, blocks };
  });
};
