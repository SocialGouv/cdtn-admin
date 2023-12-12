import type { SourceValues } from "@socialgouv/cdtn-sources";
import fetch from "node-fetch";
import PQueue from "p-queue";

import type { GetBreadcrumbsFn } from "./breadcrumbs";
import { context } from "./context";
import type { Glossary } from "./types";
import type {
  AggregateDocumentBySource,
  Document,
  DocumentElastic,
  DocumentElasticWithSource,
  DocumentRef,
  DocumentWithRelation,
  GetGlossaryResponse,
  Relation,
  RequestBySourceWithRelationsResponse,
} from "./types/Glossary";
import { Breadcrumbs } from "@shared/types";

const PAGE_SIZE = 200;
const JOB_CONCURRENCY = 5;

const gqlRequestBySource = (
  source: SourceValues,
  offset = 0,
  limit: number | null = null
): string =>
  JSON.stringify({
    query: `{
  documents(
    order_by: {cdtn_id: asc}
    limit: ${limit}
    offset: ${offset}
    where: {source: {_eq: "${source}"},  is_available: {_eq: true} }
  ) {
    id:initial_id
    cdtnId:cdtn_id
    title
    slug
    source
    text
    isPublished: is_published
    isSearchable: is_searchable
    metaDescription:meta_description
    document
  }
}`,
  });

const gqlRequestBySourceWithRelations = (
  source: SourceValues,
  offset = 0,
  limit: number | null = null
): string =>
  JSON.stringify({
    query: `{
        documents(order_by: {cdtn_id: asc}, limit: ${limit}, offset: ${offset}, where: {source: {_eq: "${source}"}, is_available: {_eq: true}}) {
          id: initial_id
          cdtnId: cdtn_id
          title
          slug
          source
          text
          isPublished: is_published
          isSearchable: is_searchable
          metaDescription: meta_description
          document
          contentRelations: relation_a(where: {type: {_eq: "document-content"}, b: {is_published: {_eq: true}, is_available: {_eq: true}}}) {
            position: data(path: "position")
            content: b {
              cdtnId: cdtn_id
              slug
              source
              title
              document
            }
          }
        }
      }`,
  });

const gqlAgreggateDocumentBySource = (source: SourceValues): string =>
  JSON.stringify({
    query: `{
  documents_aggregate(where: {is_available:{_eq: true}, source: {_eq: "${source}"}}){
    aggregate {
      count
    }
  }
}`,
  });

const gqlGlossary = (): string =>
  JSON.stringify({
    query: `query Glossary {
      glossary {term, abbreviations, definition, variants, references, slug}
 }`,
  });

export async function getGlossary(): Promise<Glossary> {
  const CDTN_ADMIN_ENDPOINT: string =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const result = await fetch(CDTN_ADMIN_ENDPOINT, {
    body: gqlGlossary(),
    method: "POST",
  }).then(async (r) => (await r.json()) as GetGlossaryResponse);
  if (result.errors?.length) {
    console.error(result.errors[0].message);
    throw new Error(`error fetching kali blocks`);
  }
  return result.data?.glossary ?? [];
}

export async function getDocumentBySource<T>(
  source: SourceValues,
  getBreadcrumbs: GetBreadcrumbsFn | undefined = undefined
): Promise<DocumentElasticWithSource<T>[]> {
  const fetchDocuments = createDocumentsFetcher(gqlRequestBySource);
  const pDocuments = await fetchDocuments(source, {
    concurrency: 5,
    pageSize: 100,
  });
  const documents = await Promise.all(pDocuments);
  return documents.flatMap((docs) =>
    docs.map((doc) => toElastic<T>(doc, [], getBreadcrumbs))
  );
}

export async function getDocumentBySourceWithRelation(
  source: SourceValues,
  getBreadcrumbs: GetBreadcrumbsFn
): Promise<DocumentElastic[]> {
  const fetchDocuments = createDocumentsFetcher(
    gqlRequestBySourceWithRelations
  );
  const pDocuments = await fetchDocuments(source, {
    concurrency: 3,
    pageSize: 100,
  });
  const documents = await Promise.all(pDocuments);
  return documents.flatMap((docs) =>
    docs.map((doc) =>
      toElastic(
        {
          ...doc,
        },
        toRefs(doc.contentRelations, getBreadcrumbs)
      )
    )
  );
}

const createDocumentsFetcher =
  (gqlRequest = gqlRequestBySource) =>
  async (
    source: SourceValues,
    { pageSize = PAGE_SIZE, concurrency = JOB_CONCURRENCY }
  ): Promise<Promise<DocumentWithRelation[]>[]> => {
    const CDTN_ADMIN_ENDPOINT: string =
      context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
    const nbDocResult = await fetch(CDTN_ADMIN_ENDPOINT, {
      body: gqlAgreggateDocumentBySource(source),
      method: "POST",
    }).then(
      async (r) => (await r.json()) as Promise<AggregateDocumentBySource>
    );
    if (!nbDocResult.data) {
      return [];
    }
    const nbDoc = nbDocResult.data.documents_aggregate.aggregate.count;
    const queue = new PQueue({ concurrency });

    return Array.from({ length: Math.ceil(nbDoc / pageSize) }, (_, i) => i).map(
      async (index): Promise<DocumentWithRelation[]> => {
        return queue.add(async () => {
          return fetch(CDTN_ADMIN_ENDPOINT, {
            body: gqlRequest(source, index * pageSize, pageSize),
            method: "POST",
          })
            .then(async (res) => {
              if (res.ok) {
                return (await res.json()) as Promise<RequestBySourceWithRelationsResponse>;
              }
              const error = new Error(res.statusText) as Error & {
                status: number;
              };
              error.status = res.status;
              throw error;
            })
            .then((result) => {
              if (result.errors) {
                console.error(result.errors);
                throw new Error(JSON.stringify(result.errors[0]));
              }
              return result.data?.documents ?? [];
            });
        });
      }
    );
  };

function toElastic<T>(
  {
    id,
    cdtnId,
    title,
    source,
    slug,
    text,
    isSearchable,
    isPublished,
    metaDescription,
    document,
  }: Document,
  refs: DocumentRef[],
  getBreadcrumbs: GetBreadcrumbsFn | undefined = undefined
): DocumentElasticWithSource<T> {
  let breadcrumbs: Breadcrumbs[] = [];
  if (getBreadcrumbs) {
    breadcrumbs = getBreadcrumbs(cdtnId);
  }
  return {
    ...(document as T),
    breadcrumbs,
    cdtnId,
    excludeFromSearch: !isSearchable,
    id,
    isPublished,
    metaDescription,
    refs,
    slug,
    source,
    text,
    title,
  };
}

function toRefs(
  contentRelations: Relation[],
  getBreadcrumbs: GetBreadcrumbsFn
): DocumentRef[] {
  return contentRelations
    .sort(
      ({ position: positionA }, { position: positionB }) =>
        positionA - positionB
    )
    .map(({ content: { cdtnId, document, slug, source, title } }) => ({
      breadcrumbs: getBreadcrumbs(cdtnId),
      cdtnId,
      description: (document as { description: string }).description,
      slug,
      source,
      title,
      url: (document as { url?: string }).url,
    }));
}
