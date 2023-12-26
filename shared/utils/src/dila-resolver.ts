import type {
  DocumentReference,
  ArticlePayload,
  ArticleVersion,
} from "@shared/types";
import type DilaApiClient from "@socialgouv/dila-api-client";

function createGetArticleReference(client: DilaApiClient) {
  return async function getArticle(
    id: string
  ): Promise<DocumentReference | null> {
    try {
      const apiResult = (await client.fetch({
        method: "POST",
        params: {
          id,
        },
        path: "/consult/getArticle",
      })) as Record<string, unknown>;
      const data = checkApiResponse(id, apiResult);
      const [lastVersion] = data.article.articleVersions.slice(-1);
      const containerId =
        data.article.conteneurs.length > 0
          ? data.article.conteneurs[0]!.cid
          : data.article.textTitles[0]!.id;
      return {
        dila_cid: data.article.cid,
        dila_container_id: containerId,
        dila_id: lastVersion!.id,
        title: `${data.article.nature} ${data.article.num}`,
        url: "",
      };
    } catch (e: unknown) {
      console.error(`Error retrieving info about article id ${id}`, e);
      return null;
    }
  };
}

function getLatestVersion(articleVersions: ArticleVersion[]): ArticleVersion {
  return articleVersions.reduce(
    (latest: ArticleVersion, article: ArticleVersion) => {
      if (parseFloat(article.version) > parseFloat(latest.version)) {
        return article;
      }
      return latest;
    }
  );
}

function extractArticleId(url: string): string[] {
  const match = /(?:LEGI|KALI)ARTI\d{12}/.exec(url);
  return match && match.length > 0 ? match.slice(0, 1) : [];
}

function checkApiResponse(
  id: string,
  data: Record<string, unknown>
): ArticlePayload {
  if (Object.keys(data).length === 1) {
    throw new Error(
      `invalid response for ${id}, payload: ${JSON.stringify(data)}`
    );
  }

  return data as unknown as ArticlePayload;
}

export { createGetArticleReference, extractArticleId, getLatestVersion };
