import { gqlClient } from "@shared/utils";

const insertLegiArticlesMutation = `
mutation insert_legi_articles($articles: [legi_articles_insert_input!]!) {
  insert_legi_articles(objects: $articles, on_conflict: {constraint: legi_articles_pkey, update_columns: label}) {
    affected_rows
  }
}
`;

interface Result {
  insert_legi_articles: { affected_rows: number };
}

interface LegiArticlesInput {
  cid: string;
  id: string;
  label: string;
}

export async function updateLabourCodeArticles(
  articles: LegiArticlesInput[]
): Promise<number> {
  const result = await gqlClient()
    .mutation<Result>(insertLegiArticlesMutation, {
      articles: articles.map((item) => ({
        ...item,
      })),
    })
    .toPromise();

  if (result.error) {
    console.error(result.error.graphQLErrors[0]);
    throw new Error(`error inserting references ${result.error}`);
  }

  if (!result.data) {
    console.error(
      `Echec lors de la sauvegarde des articles pour le code du travail`
    );
    throw new Error(
      `Echec lors de la sauvegarde des articles pour le code du travail -> ${result.error}`
    );
  }

  return result.data.insert_legi_articles.affected_rows;
}
