import {
  KaliBlockByIdccResult,
  KaliArticlesByIdResult,
  ArticleByTheme,
} from "@shared/types";
import { gqlClient } from "@shared/utils";
import { context } from "../context";

const getKaliBlocksQueryByIdcc = `
query getKaliBlocksByIdcc($idcc: Int!) {
  kali_blocks(where: {idcc: {_eq: $idcc}}) {
    id
    blocks
  }
}
`;

const getKaliArticlesByIds = `
query getKaliArticles($listIds: [String!]) {
  kali_articles(where: {id: {_in: $listIds}}) {
    id
    cid
    label
    section
  }
}
`;

export function getArticleNumberWithPath(path?: string) {
  if (!path) return "non numéroté";
  const lastPart = path.split(" » ").pop();
  if (lastPart?.includes("Article")) {
    return lastPart.replace("Article ", "");
  }
  return "non numéroté";
}

export function getArticleIds(result: KaliBlockByIdccResult) {
  const dt: string[] = [];
  result.kali_blocks.flatMap((block) =>
    Object.values(block.blocks).map((blockValue) => {
      if (blockValue.length > 0) dt.push(...blockValue);
    })
  );
  return dt;
}

export function generateArticleByTheme(
  kaliBlock: KaliBlockByIdccResult,
  kaliArticle: KaliArticlesByIdResult
): ArticleByTheme[] {
  const result: ArticleByTheme[] = [];
  kaliBlock.kali_blocks.forEach((block) => {
    const keys = Object.keys(block.blocks);
    const values = Object.values(block.blocks);
    for (let i = 0; i < keys.length; i++) {
      const art: ArticleByTheme["articles"] = [];
      if (values[i].length > 0) {
        values[i].forEach((articleId) => {
          const articleFound = kaliArticle.kali_articles.find(
            (a) => a.id === articleId
          );
          if (articleFound) {
            art.push({
              cid: articleFound.cid,
              id: articleFound.id,
              section: articleFound.section,
              title: getArticleNumberWithPath(articleFound.label),
            });
          }
        });
        result.push({
          bloc: keys[i],
          articles: art,
        });
      }
    }
  });

  return result;
}

export default async function getAgreementsArticlesByTheme(
  idccNumber: number
): Promise<ArticleByTheme[]> {
  const HASURA_GRAPHQL_ENDPOINT = context.get("cdtnAdminEndpoint");
  const HASURA_GRAPHQL_ENDPOINT_SECRET = context.get("cdtnAdminEndpointSecret");
  const resultKaliBlocks = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<KaliBlockByIdccResult>(getKaliBlocksQueryByIdcc, {
      idcc: idccNumber,
    })
    .toPromise();
  if (resultKaliBlocks.error) {
    throw new Error(`Error fetching kali blocks`);
  }
  if (!resultKaliBlocks.data) {
    return [];
  }

  const allKaliArticlesIds = getArticleIds(resultKaliBlocks.data);

  const resultKaliArticles = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<KaliArticlesByIdResult>(getKaliArticlesByIds, {
      listIds: allKaliArticlesIds,
    })
    .toPromise();

  if (resultKaliArticles.error) {
    throw new Error(`Error fetching kali articles`);
  }

  if (!resultKaliArticles.data) {
    throw Error("No kali articles founds for this agreement 🤔");
  }

  return generateArticleByTheme(resultKaliBlocks.data, resultKaliArticles.data);
}
