import { Client } from "@elastic/elasticsearch";
import {
  accordMapping,
  createIndex,
  indexDocumentsBatched,
} from "@socialgouv/cdtn-elasticsearch";
import { gqlClient } from "@shared/utils";

import { populateAccords } from "./accords";
import { context } from "./context";

jest.mock("@socialgouv/cdtn-elasticsearch", () => ({
  accordMapping: { properties: { __sentinel: true } },
  createIndex: jest.fn(),
  indexDocumentsBatched: jest.fn(),
}));

jest.mock("@shared/utils", () => ({
  gqlClient: jest.fn(),
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

const mockedGqlClient = gqlClient as unknown as jest.Mock;
const client = {} as Client;

interface RawAccord {
  id: string;
  [key: string]: unknown;
}

const rawAccord = (
  id: string,
  over: Record<string, unknown> = {}
): RawAccord => ({
  id,
  title: `Accord ${id}`,
  siret: "12345678900011",
  date_maj: "2026-01-01",
  date_depot: "2026-01-02",
  date_effet: "2026-01-03",
  date_fin: "2999-01-01",
  date_diffusion: "2026-01-04",
  conforme_version_integrale: true,
  themes: ["Salaires"],
  signataires: ["06"],
  ...over,
});

// Simule Hasura : la requête d'agrégat renvoie le total, la requête paginée
// renvoie la tranche correspondant à l'offset/limit demandé.
let queryMock: jest.Mock;

function mockDb(accords: RawAccord[]) {
  queryMock = jest.fn(
    (
      queryStr: string,
      vars: { limit: number; offset: number; today: string }
    ) => ({
      toPromise: () =>
        Promise.resolve(
          queryStr.includes("aggregate")
            ? {
                data: {
                  accords_aggregate: { aggregate: { count: accords.length } },
                },
              }
            : {
                data: {
                  accords: accords.slice(vars.offset, vars.offset + vars.limit),
                },
              }
        ),
    })
  );
  mockedGqlClient.mockReturnValue({ query: queryMock });
}

afterEach(() => {
  jest.resetAllMocks();
});

test("crée l'index accords avec le mapping dédié", async () => {
  // nctx requiert provide() dans la même branche async que la lecture du
  // contexte : on l'appelle donc dans chaque test (cf. suggestion.test.ts).
  context.provide();
  mockDb([rawAccord("A")]);
  await populateAccords(client, "cdtn_accords-123", 2);
  expect(createIndex).toHaveBeenCalledTimes(1);
  expect(createIndex.mock.calls[0][0]).toMatchObject({
    client,
    indexName: "cdtn_accords-123",
    mappings: accordMapping,
  });
});

test("ne récupère que les accords actifs (filtre date_fin > aujourd'hui)", async () => {
  context.provide();
  mockDb([rawAccord("A"), rawAccord("B"), rawAccord("C")]);
  await populateAccords(client, "cdtn_accords-123", 2);
  const today = new Date().toISOString().slice(0, 10);
  // le comptage et chaque page reçoivent la date du jour comme filtre
  expect(queryMock.mock.calls.length).toBeGreaterThan(1);
  for (const [, vars] of queryMock.mock.calls) {
    expect(vars.today).toBe(today);
  }
});

test("n'indexe rien lorsque la BDD ne contient aucun accord", async () => {
  context.provide();
  mockDb([]);
  await populateAccords(client, "cdtn_accords-123", 2);
  expect(createIndex).toHaveBeenCalledTimes(1);
  expect(indexDocumentsBatched).not.toHaveBeenCalled();
});

test("pagine et indexe tous les accords", async () => {
  context.provide();
  mockDb([rawAccord("A"), rawAccord("B"), rawAccord("C")]);
  await populateAccords(client, "cdtn_accords-123", 2);
  // 3 accords, pages de 2 => 2 lots (offset 0 puis 2)
  expect(indexDocumentsBatched).toHaveBeenCalledTimes(2);
  const pushed = indexDocumentsBatched.mock.calls.flatMap(
    (call: [{ documents: { id: string }[] }]) => call[0].documents
  );
  expect(pushed.map((doc: { id: string }) => doc.id)).toEqual(["A", "B", "C"]);
});

test("mappe les colonnes snake_case vers le document ES camelCase", async () => {
  context.provide();
  mockDb([rawAccord("A", { siret: null, date_effet: "2026-05-01" })]);
  await populateAccords(client, "cdtn_accords-123", 10);
  expect(indexDocumentsBatched.mock.calls[0][0].documents[0]).toEqual({
    id: "A",
    title: "Accord A",
    siret: null,
    dateMaj: "2026-01-01",
    dateDepot: "2026-01-02",
    dateEffet: "2026-05-01",
    dateFin: "2999-01-01",
    dateDiffusion: "2026-01-04",
    conformeVersionIntegrale: true,
    themes: ["Salaires"],
    signataires: ["06"],
  });
});

test("lève une erreur si la récupération échoue", async () => {
  context.provide();
  mockedGqlClient.mockReturnValue({
    query: () => ({ toPromise: () => Promise.resolve({ error: "boom" }) }),
  });
  await expect(populateAccords(client, "cdtn_accords-123", 2)).rejects.toThrow(
    /counting accords/i
  );
});
