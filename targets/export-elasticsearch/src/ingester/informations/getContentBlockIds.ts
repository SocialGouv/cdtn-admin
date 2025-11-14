import {
  EditorialContentBaseContentPart,
  EditorialContentType,
} from "@socialgouv/cdtn-types";

export const getContentBlockIds = (
  data: EditorialContentBaseContentPart[]
): string[] => {
  return data.reduce((idsAcc: string[], content) => {
    content.blocks = content.blocks ?? [];
    return idsAcc.concat(
      content.blocks.flatMap((block) => {
        return block.type === EditorialContentType.content
          ? (block.contents
              .map(({ cdtnId }) => cdtnId)
              .filter((cdtnId: string) => idsAcc.indexOf(cdtnId) === -1) ?? [])
          : [];
      })
    );
  }, []);
};
