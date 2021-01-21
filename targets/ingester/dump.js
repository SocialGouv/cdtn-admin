const fetch = require("isomorphic-unfetch");
const { createClient } = require("@urql/core");
const { generateIds } = require("@shared/id-generator");
const slugify = require("@socialgouv/cdtn-slugify");

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;

const client = createClient({
  fetch,
  fetchOptions: {
    headers: {
      "Content-Type": "application/json",
    },
  },
  requestPolicy: "network-only",
  url: HASURA_GRAPHQL_ENDPOINT,
});

const rawQualifieds = require("../../../datafiller-data/data/requests.json");
const { SOURCES, getSourceByRoute } = require("../../../cdtn/packages/sources");

const contentRelations = [];

const findReferenceQuery = `
  query FindReference($slug: String!, $source: String!) {
    documents(where: {slug: {_eq: $slug}, source: {_eq: $source}}) {
      cdtnId: cdtn_id
    }
  }
`;

async function main() {
  // first loop is made to format rawQualifieds into qualifieds
  const qualifieds = rawQualifieds.map((rawQualified) => {
    return {
      ...rawQualified,
      title: rawQualified.title.replace(/'/g, "’"),
      ...generateIds(SOURCES.PREQUALIFIED),
      source: SOURCES.PREQUALIFIED,
    };
  });
  for (const qualified of qualifieds) {
    for (const [i, { url }] of qualified.refs.entries()) {
      const urlArray = url.split("#").shift().split("/");
      const slug = urlArray.pop();
      const source = getSourceByRoute(urlArray.pop());
      const {
        data: { documents },
      } = await client
        .query(findReferenceQuery, {
          slug,
          source:
            source === SOURCES["SHEET_MT"] ? SOURCES["SHEET_MT_PAGE"] : source,
        })
        .toPromise();
      const relatedDocument = documents[0];
      if (relatedDocument && relatedDocument.cdtnId) {
        contentRelations.push({
          data: {
            position: i,
          },
          document_a: qualified.cdtn_id,
          document_b: relatedDocument.cdtnId,
          type: "document-content",
        });
      }
    }
    delete qualified.refs;
  }
  console.log(`
  INSERT INTO public.documents (cdtn_id, initial_id, title, meta_description, source, slug, text, document, is_published, is_searchable, is_available)
    VALUES ${qualifieds.map(insertIntoDocuments).join(",\n")};
  INSERT INTO public.document_relations (document_a, document_b, type, data)
    VALUES ${contentRelations.map(insertIntoRelations).join(",\n")};
  `);
}

function insertIntoDocuments(document) {
  const { cdtn_id, initial_id, source, title, ...props } = document;

  return `('${cdtn_id}', '${initial_id}', '${title}', '${title}', '${source}', '${slugify(
    title
  )}', $$${title}$$, $$${JSON.stringify(props)}$$, FALSE, FALSE, TRUE)`;
}

function insertIntoRelations(relation) {
  const { document_a, document_b, data, type } = relation;

  return `('${document_a}', '${document_b}', '${type}', '${JSON.stringify(
    data
  )}')`;
}

main();
