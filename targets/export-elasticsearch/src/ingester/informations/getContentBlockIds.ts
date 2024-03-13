import { BaseContentPart, CONTENT_TYPE } from "@shared/types";

export const getContentBlockIds = (data: BaseContentPart[]): string[] => {
  return data.reduce((idsAcc: string[], content) => {
    content.blocks = content.blocks ?? [];
    return idsAcc.concat(
      content.blocks.flatMap((block) => {
        return block.type === CONTENT_TYPE.content
          ? block.contents
              .map(({ cdtnId }) => cdtnId)
              .filter((cdtnId: string) => idsAcc.indexOf(cdtnId) === -1) ?? []
          : [];
      })
    );
  }, []);
};
