import PQueue from "p-queue";

import type { GetBreadcrumbsFn } from "../breadcrumbs";
import { context } from "../context";
import type {
  Document,
  DocumentWithRelation,
  Relation,
} from "../types/Glossary";
import {
  Breadcrumb,
  DocumentElastic,
  DocumentElasticWithSource,
  DocumentRef,
} from "@socialgouv/cdtn-types";
import { gqlClient } from "@shared/utils";
import { SourceKeys } from "@socialgouv/cdtn-utils/build/sources";

const PAGE_SIZE = process.env.FETCH_PAGE_SIZE
  ? parseInt(process.env.FETCH_PAGE_SIZE)
  : 250;
const JOB_CONCURRENCY = process.env.FETCH_JOB_CONCURRENCY
  ? parseInt(process.env.FETCH_JOB_CONCURRENCY)
  : 5;

interface DocumentRequestVariables {
  source: string;
  offset: number;
  limit: number;
}

type DocumentRequestGenerator = (param: DocumentRequestVariables) => {
  query: string;
  variables: DocumentRequestVariables;
};

const gqlRequestBySource: DocumentRequestGenerator = ({
  source,
  offset = 0,
  limit,
}) => ({
  query: graphQLRequestBySource,
  variables: {
    source,
    offset,
    limit,
  },
});

const graphQLRequestBySource = `
query GetDocuments($source: String, $limit: Int, $offset: Int) {
  documents(order_by: {cdtn_id: asc}, limit: $limit, offset: $offset, where: {source: {_eq: $source}, is_available: {_eq: true}}) {
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
  }
}
`;

const gqlRequestBySourceWithRelations: DocumentRequestGenerator = ({
  source,
  offset,
  limit,
}) => ({
  query: graphQLRequestBySourceWithRelations,
  variables: {
    source,
    offset,
    limit,
  },
});

const graphQLRequestBySourceWithRelations = `
query GetDocumentsWithRelations($source: String, $limit: Int, $offset: Int) {
  documents(order_by: {cdtn_id: asc}, limit: $limit, offset: $offset, where: {source: {_eq: $source}, is_available: {_eq: true}}) {
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
}

`;

const graphQLAgreggateDocumentBySource = `
query GetDocumentCount($source: String) {
  documents_aggregate(where: {is_available: {_eq: true}, source: {_eq: $source}}) {
    aggregate {
      count
    }
  }
}
`;

export async function getDocumentBySource<T>(
  source: SourceKeys,
  getBreadcrumbs: GetBreadcrumbsFn | undefined = undefined
): Promise<DocumentElasticWithSource<T>[]> {
  const fetchDocuments = createDocumentsFetcher(gqlRequestBySource);
  const pDocuments = await fetchDocuments(source, {
    concurrency: JOB_CONCURRENCY,
    pageSize: PAGE_SIZE,
  });
  const documents = await Promise.all(pDocuments);
  return documents.flatMap((docs) =>
    docs.map((doc) => toElastic<T>(doc, [], getBreadcrumbs))
  );
}

export async function getDocumentBySourceWithRelation(
  source: SourceKeys,
  getBreadcrumbs: GetBreadcrumbsFn
): Promise<DocumentElastic[]> {
  const fetchDocuments = createDocumentsFetcher(
    gqlRequestBySourceWithRelations
  );
  const pDocuments = await fetchDocuments(source, {
    concurrency: JOB_CONCURRENCY,
    pageSize: PAGE_SIZE,
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
  (requestGenerator = gqlRequestBySource) =>
  async (
    source: SourceKeys,
    { pageSize = PAGE_SIZE, concurrency = JOB_CONCURRENCY }
  ): Promise<Promise<DocumentWithRelation[]>[]> => {
    const graphqlEndpoint: string =
      context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
    const adminSecret: string =
      context.get("cdtnAdminEndpointSecret") || "admin1";
    const nbDocResult = await gqlClient({
      graphqlEndpoint,
      adminSecret,
    })
      .query<
        { documents_aggregate: { aggregate: { count: number } } },
        { source: string }
      >(graphQLAgreggateDocumentBySource, { source })
      .toPromise();
    if (nbDocResult.error) {
      throw new Error(
        `Failed to count ${source} documents -> ${JSON.stringify(
          nbDocResult.error
        )}`
      );
    }
    if (!nbDocResult.data) {
      return [];
    }
    const nbDoc = nbDocResult.data.documents_aggregate.aggregate.count;
    const queue = new PQueue({ concurrency });

    return Array.from({ length: Math.ceil(nbDoc / pageSize) }, (_, i) => i).map(
      async (index): Promise<DocumentWithRelation[]> => {
        const request = requestGenerator({
          source,
          offset: index * pageSize,
          limit: pageSize,
        });
        return queue.add(async () => {
          return gqlClient({
            graphqlEndpoint,
            adminSecret,
          })
            .query<
              { documents: DocumentWithRelation[] },
              DocumentRequestVariables
            >(request.query, request.variables)
            .toPromise()
            .then((res) => {
              if (res.error) {
                throw new Error(JSON.stringify(res.error));
              }
              if (!res.data) {
                throw new Error(`No data found for source ${source}`);
              }
              return res.data.documents;
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
  let breadcrumbs: Breadcrumb[] = [];
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
