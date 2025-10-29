import slugify from "@socialgouv/cdtn-slugify";
import {
  Information,
  InformationContent,
  InformationContentBlock,
  InformationContentBlockContent,
  Reference
} from "../../type";
import { UpsertInformationObject } from "./editInformation.type";
import { undefined } from "zod";

const removeTypename = (obj: any) => {
  delete obj?.__typename;
  return obj;
};

export const getRawColumns = (obj?: any): string[] => {
  if (!obj) return [];
  return Object.entries(obj).reduce<string[]>((result, [key, value]) => {
    if (key === "__typename" || (value && typeof value === "object"))
      return result;
    return [...result, key];
  }, []);
};

const mapInformationContentsBlocksContents = (
  contents?: InformationContentBlockContent[] | null
) => {
  return {
    on_conflict: {
      constraint: "informations_contents_blocks_contents_pkey",
      update_columns: getRawColumns(contents?.[0])
    },
    data:
      contents?.map((contentBlock, contentBlockIndex) => {
        return {
          ...removeTypename(contentBlock),
          document: undefined,
          cdtnId: contentBlock.document.cdtnId,
          order: contentBlockIndex + 1
        };
      }) ?? []
  };
};

const mapInformationContentsBlocks = (
  blocks: InformationContentBlock[] | null
) => {
  console.log("mapInformationContentsBlocks", blocks);
  return {
    on_conflict: {
      constraint: "informations_contents_blocks_pkey",
      update_columns: getRawColumns(blocks?.[0])
    },
    data:
      blocks?.map((block, blockIndex) => {
        return {
          ...removeTypename(block),
          ...(block.type === "graphic"
            ? {
                infographic_id: block.infographic_id!
              }
            : {}),
          ...(block.type === "content"
            ? {
                contents: mapInformationContentsBlocksContents(block.contents)
              }
            : {}),
          order: blockIndex + 1
        };
      }) ?? []
  };
};

const mapInformationContentsReferences = (references?: Reference[] | null) => {
  return {
    on_conflict: {
      constraint: "informations_contents_references_pkey",
      update_columns: getRawColumns(references?.[0])
    },
    data:
      references?.map((reference, referenceIndex) => ({
        ...removeTypename(reference),
        order: referenceIndex + 1
      })) ?? []
  };
};

const mapInformationContents = (contents?: InformationContent[]) => {
  return {
    on_conflict: {
      constraint: "informations_contents_pkey",
      update_columns: getRawColumns(contents?.[0])
    },
    data: contents?.map((content, contentIndex) => {
      const blocks = mapInformationContentsBlocks(content.blocks);
      const references = mapInformationContentsReferences(content.references);
      return {
        ...removeTypename(content),
        order: contentIndex + 1,
        name: slugify(content.title),
        blocks,
        references
      };
    })
  };
};

const mapInformationReferences = (references?: Reference[]) => {
  return {
    on_conflict: {
      constraint: "informations_references_pkey",
      update_columns: getRawColumns(references?.[0])
    },
    data:
      references?.map((reference, referenceIndex) => ({
        ...removeTypename(reference),
        order: referenceIndex + 1
      })) ?? []
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
    references
  };
};
