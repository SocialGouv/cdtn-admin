import {
  KaliBlockByIdccResult,
  KaliArticlesByIdResult,
  ArticleByTheme,
} from "@shared/types";
import { gqlClient, logger } from "@shared/utils";
import { context } from "../context";
import { detectNullInObject } from "../utils/detectNullInObject";

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
        if (art.length > 0) {
          result.push({
            bloc: keys[i],
            articles: art,
          });
        }
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
    console.error(
      `Note: idcc ${idccNumber} n'est pas présent dans la table kali_block`
    );
    return [];
  }
  if (
    !resultKaliBlocks.data?.kali_blocks ||
    detectNullInObject(resultKaliBlocks.data.kali_blocks)
  ) {
    console.error(`Aucun kali_block trouvé pour l'idcc ${idccNumber}`);
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

  if (resultKaliArticles.error || !resultKaliArticles.data) {
    console.error(
      `Aucun kali_articles n'a été trouvé pour cette liste d'id ${JSON.stringify(
        allKaliArticlesIds
      )}`
    );
    return [];
  }

  if (
    resultKaliArticles.data.kali_articles.length !== allKaliArticlesIds.length
  ) {
    logger.warn(
      `${allKaliArticlesIds.length} kali-block renseigné et seulement ${resultKaliArticles.data.kali_articles.length} articles trouvés en base de données pour la CC ${idccNumber}`
    );
  }

  return generateArticleByTheme(resultKaliBlocks.data, resultKaliArticles.data);
}
