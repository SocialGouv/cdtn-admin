import { gqlClient } from "@shared/utils";

const insertKaliReferenceMutation = `
mutation insert_kali_articles($articles: [kali_articles_insert_input!]!) {
  insert_kali_articles(objects: $articles, on_conflict: {constraint: kali_articles_pkey, update_columns: [path, label, section]}) {
    affected_rows
  }
}
`;

interface InsertKaliRefrenceResult {
  insert_kali_articles: { affected_rows: number };
}

export interface KaliArticlesInput {
  agreement_id: string;
  cid: string;
  id: string;
  path: string;
  label: string;
  section: string;
}

export async function updateAgreementArticles(
  idcc: string,
  articles: KaliArticlesInput[]
): Promise<number> {
  const uniqueArticlesMap = new Map<string, KaliArticlesInput>();

  articles.forEach((article) => {
    uniqueArticlesMap.set(article.id, article);
  });

  const uniqueArticles = Array.from(uniqueArticlesMap.values());

  const result = await gqlClient()
    .mutation<InsertKaliRefrenceResult>(insertKaliReferenceMutation, {
      articles: uniqueArticles.map((item) => ({
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
