import { client } from "@shared/graphql-client";
import type { KaliArticleHDN } from "@shared/types";

const kaliblockQuery = `
query KaliBlocks {
  kaliBlocks: kali_blocks {id, blocks}
}
`;

type KaliblockResult = {
  kaliBlocks: KaliArticleHDN[];
};

export async function getAllKaliBlocks(): Promise<KaliArticleHDN[]> {
  const result = await client
    .query<KaliblockResult>(kaliblockQuery)
    .toPromise();

  if (result.error) {
    console.error(result.error.name, result.error.message);
    throw new Error(`error fetching kali blocks`);
  }
  if (result.data) {
    return result.data.kaliBlocks;
  }
  throw new Error(`error fetching kali blocks - no data`);
}
