import { client } from "@shared/graphql-client";

const insertKaliReferenceMutation = `
mutation insert_kali_articles($articles: [kali_articles_insert_input!]!) {
  insert_kali_articles(objects: $articles, on_conflict: {constraint: kali_articles_pkey, update_columns: [path, label]}) {
    affected_rows
  }
}
`;

type InsertKaliRefrenceResult = {
  insert_kali_articles: { affected_rows: number };
};

type KaliArticlesInput = {
  agreement_id: string;
  cid: string;
  id: string;
  path: string;
  label: string;
};

export async function updateAgreementArticles(
  idcc: string,
  articles: KaliArticlesInput[]
): Promise<number> {
  const result = await client
    .mutation<InsertKaliRefrenceResult>(insertKaliReferenceMutation, {
      articles: articles.map((item) => ({
        ...item,
        agreement_id: idcc,
      })),
    })
    .toPromise();

  if (result.error) {
    console.error(result.error.graphQLErrors[0]);
    throw new Error(`error inserting references ${result.error}`);
  }

  if (!result.data) {
    console.error(
      `Echec lors de la sauvegarde des articles pour la CC ${idcc}`
    );
    throw new Error(
      `Echec lors de la sauvegarde des articles pour la CC ${idcc} -> ${result.error}`
    );
  }

  return result.data.insert_kali_articles.affected_rows;
}
