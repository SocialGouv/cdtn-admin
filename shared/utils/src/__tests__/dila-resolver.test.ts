import type DilaApiClient from "@socialgouv/dila-api-client";

import { createGetArticleReference, extractArticleId } from "../dila-resolver";
import getKaliArticlePayload from "./__mocks__/kaliArticle.json";
import getLegiArticlePayload from "./__mocks__/legiArticle.json";

test("extractArticleId with legi ref", () => {
  const ref = "LEGIARTI000042683537";
  const urlWithRef = `https://www.legifrance.gouv.fr/codes/article_lc/${ref}/`;
  expect(extractArticleId(urlWithRef).toString()).toEqual([ref].toString());
});

test("extractArticleId with kali ref", () => {
  const ref = "KALIARTI000005849401";
  const urlWithRef = `https://legifrance.gouv.fr/conv_coll/id/${ref}/?idConteneur=KALICONT000005635624`;
  expect(extractArticleId(urlWithRef).toString()).toEqual([ref].toString());
});

test("extractArticleId with jor ref", () => {
  const ref = "JORFARTI000043567208";
  const urlWithRef = `https://www.legifrance.gouv.fr/jorf/article_jo/${ref}/`;
  expect(extractArticleId(urlWithRef)).toEqual([]);
});

test("extractArticleId with no ref", () => {
  const urlWithNoRef = `ttps://www.service-public.fr/particuliers/vosdroits/F13965`;
  expect(extractArticleId(urlWithNoRef)).toEqual([]);
});

test("createGetArticleVersion should return a legi article reference", async () => {
  const dilaApiClientMock = {
    fetch: async () => Promise.resolve(getLegiArticlePayload),
  } as unknown as DilaApiClient;

  const getArticleReference = createGetArticleReference(dilaApiClientMock);

  const versions = await getArticleReference("LEGIARTI000033024743");
  expect(versions).toEqual({
    dila_cid: "LEGIARTI000006901086",
    dila_container_id: "LEGITEXT000006072050",
    dila_id: "LEGIARTI000042683537",
    title: "Article L1233-71",
    url: "",
  });
});

test("createGetArticleVersion should return a kali article reference", async () => {
  const dilaApiClientMock = {
    fetch: async () => Promise.resolve(getKaliArticlePayload),
  } as unknown as DilaApiClient;

  const getArticleReference = createGetArticleReference(dilaApiClientMock);

  const versions = await getArticleReference("LEGIARTI000033024743");
  expect(versions).toEqual({
    dila_cid: "KALIARTI000005846033",
    dila_container_id: "KALICONT000005635613",
    dila_id: "KALIARTI000005846034",
    title: "Article 18",
    url: "",
  });
});
