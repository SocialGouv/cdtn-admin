import { client } from "@shared/graphql-client";

const kaliblockQuery = `
query KaliBlocks {
  kaliBlocks: kali_blocks {id, blocks}
}
`;
/**
 *
 * @returns {Promise<ingester.KaliArticleHDN[]>}
 */
export async function getAllKaliBlocks() {
  /** @type {import("@shared/graphql-client").OperationResult<{kaliBlocks: ingester.KaliArticleHDN[]}>} */
  const result = await client.query(kaliblockQuery).toPromise();

  if (result.error) {
    console.error(result.error.name, result.error.message);
    throw new Error(`error fetching kali blocks`);
  }
  if (result.data) {
    return result.data.kaliBlocks;
  }
  return [];
}
