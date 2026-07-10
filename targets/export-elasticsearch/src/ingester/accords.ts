import { Client } from "@elastic/elasticsearch";
import {
  accordMapping,
  createIndex,
  indexDocumentsBatched,
} from "@socialgouv/cdtn-elasticsearch";
import { gqlClient, logger } from "@shared/utils";

import { context } from "./context";
import { getAccordsCountQuery, getAccordsQuery } from "../repositories/graphql";

// taille des pages récupérées depuis la BDD et indexées dans Elasticsearch
const PAGE_SIZE = 2000;

// Ligne d'accord telle que renvoyée par Hasura (colonnes en snake_case).
interface AccordRow {
  id: string;
  title: string;
  siret: string | null;
  date_maj: string | null;
  date_depot: string | null;
  date_effet: string | null;
  date_fin: string | null;
  date_diffusion: string | null;
  conforme_version_integrale: boolean;
  themes: string[];
  signataires: string[];
}

function toElasticAccord(accord: AccordRow) {
  return {
    id: accord.id,
    title: accord.title,
    siret: accord.siret,
    dateMaj: accord.date_maj,
    dateDepot: accord.date_depot,
    dateEffet: accord.date_effet,
    dateFin: accord.date_fin,
    dateDiffusion: accord.date_diffusion,
    conformeVersionIntegrale: accord.conforme_version_integrale,
    themes: accord.themes,
    signataires: accord.signataires,
  };
}

/**
 * Récupère l'ensemble des accords d'entreprise depuis la BDD cdtn-admin et les
 * indexe dans un index Elasticsearch dédié. La récupération est paginée pour ne
 * pas charger tous les accords en mémoire.
 */
export async function populateAccords(
  client: Client,
  indexName: string,
  pageSize: number = PAGE_SIZE
): Promise<void> {
  const graphqlEndpoint: string =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const adminSecret: string =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const gql = gqlClient({ graphqlEndpoint, adminSecret });

  // On n'exporte que les accords actifs : DATE_FIN strictement après aujourd'hui.
  const today = new Date().toISOString().slice(0, 10);

  await createIndex({ client, indexName, mappings: accordMapping });

  const countResult = await gql
    .query<
      { accords_aggregate: { aggregate: { count: number } } },
      { today: string }
    >(getAccordsCountQuery, { today })
    .toPromise();
  if (countResult.error || !countResult.data) {
    throw new Error(
      `Error counting accords => ${JSON.stringify(countResult.error)}`
    );
  }
  const total = countResult.data.accords_aggregate.aggregate.count;
  logger.info(`Indexing ${total} accords into ${indexName}`);

  for (let offset = 0; offset < total; offset += pageSize) {
    const result = await gql
      .query<
        { accords: AccordRow[] },
        { limit: number; offset: number; today: string }
      >(getAccordsQuery, { limit: pageSize, offset, today })
      .toPromise();
    if (result.error || !result.data) {
      throw new Error(
        `Error fetching accords => ${JSON.stringify(result.error)}`
      );
    }
    await indexDocumentsBatched({
      client,
      indexName,
      documents: result.data.accords.map(toElasticAccord),
      size: 500,
    });
  }
}
