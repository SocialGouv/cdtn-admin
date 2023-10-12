import {
  Information,
  InformationContent,
  InformationContentBlock,
  InformationContentBlockContent,
  Reference,
  File,
} from "../../type";
import { UpsertInformationObject } from "./editInformation.type";

const removeTypename = (obj: any) => {
  delete obj?.__typename;
  delete obj?.updateDate;
  return obj;
};

const getRawColumns = (obj?: any): string[] => {
  if (!obj) return [];
  return Object.entries(obj).reduce<string[]>((result, [key, value]) => {
    if (key === "__typename" || typeof value === "object") return result;
    return [...result, key];
  }, []);
};

const mapInformationContentsBlocksFile = (file?: File | null) => {
  if (!file) return;
  return {
    on_conflict: {
      constraint: "files_pkey",
      update_columns: getRawColumns(file),
    },
    data: { ...removeTypename(file) },
  };
};

const mapInformationContentsBlocksContents = (
  contents?: InformationContentBlockContent[] | null
) => {
  return {
    on_conflict: {
      constraint:
        "informations_contents_blocks__informations_contents_blocks__key",
      update_columns: getRawColumns(contents?.[0]),
    },
    data:
      contents?.map((contentBlock, contentBlockIndex) => {
        return {
          ...removeTypename(contentBlock),
          document: undefined,
          cdtnId: contentBlock.document.cdtnId,
          order: contentBlockIndex + 1,
        };
      }) ?? [],
  };
};

const mapInformationContentsBlocks = (
  blocks: InformationContentBlock[] | null
) => {
  return {
    on_conflict: {
      constraint: "informations_contents_blocks_pkey",
      update_columns: getRawColumns(blocks?.[0]),
    },
    data:
      blocks?.map((block, blockIndex) => {
        return {
          ...removeTypename(block),
          ...(block.type === "graphic"
            ? {
                file: block.file,
                img: block.img,
              }
            : {}),
          ...(block.type === "content"
            ? {
                contents: block.contents,
              }
            : {}),
          order: blockIndex + 1,
        };
      }) ?? [],
  };
};

const mapInformationContentsReferences = (references?: Reference[] | null) => {
  return {
    on_conflict: {
      constraint: "informations_contents_references_pkey",
      update_columns: getRawColumns(references?.[0]),
    },
    data:
      references?.map((reference, referenceIndex) => ({
        ...removeTypename(reference),
        order: referenceIndex + 1,
      })) ?? [],
  };
};

const mapInformationContents = (contents?: InformationContent[]) => {
  return {
    on_conflict: {
      constraint: "informations_contents_pkey",
      update_columns: getRawColumns(contents?.[0]),
    },
    data: contents?.map((content, contentIndex) => {
      const blocks = mapInformationContentsBlocks(content.blocks);
      const references = mapInformationContentsReferences(content.references);
      return {
        ...removeTypename(content),
        order: contentIndex + 1,
        name: content.title,
        blocks,
        references,
      };
    }),
  };
};

const mapInformationReferences = (references?: Reference[]) => {
  return {
    on_conflict: {
      constraint: "informations_references_pkey",
      update_columns: getRawColumns(references?.[0]),
    },
    data:
      references?.map((reference, referenceIndex) => ({
        ...removeTypename(reference),
        order: referenceIndex + 1,
      })) ?? [],
  };
};

export const mapInformation = (
  information: Information
): UpsertInformationObject => {
  const contents = mapInformationContents(information.contents);
  const references = mapInformationReferences(information.references);
  return {
    ...removeTypename(information),
    contents,
    references,
  };
};
