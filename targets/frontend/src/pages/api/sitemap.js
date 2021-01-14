import { client } from "@shared/graphql-client";
import { getRouteBySource, SOURCES } from "@socialgouv/cdtn-sources";
import pLimit from "p-limit";

export default async function Sitemap(req, res) {
  const baseUrl = "https://code.travail.gouv.fr";
  const documents = await getDocuments();

  let latestPost = 0;

  const pages = documents.flat().map((doc) => {
    const postDate = Date.parse(doc.modified);
    if (!latestPost || postDate > latestPost) {
      latestPost = postDate;
    }
    const projectURL = `${baseUrl}/${getRouteBySource(doc.source)}/${doc.slug}`;
    return toUrlEntry(projectURL, doc.modified);
  });

  /** static pages list come from cdtn project */
  const staticPages = [
    `/a-propos`,
    `/droit-du-travail`,
    `/mentions-legales`,
    `/politique-confidentialite`,
    `/integration`,
    `/glossaire`,
  ]
    .map((path) => `${baseUrl}${path}`)
    .map(toUrlEntry);

  const glossaryTerms = await getGlossary();
  const glossaryPages = glossaryTerms.map(({ slug, modified }) =>
    toUrlEntry(
      `${baseUrl}/${getRouteBySource(SOURCES.GLOSSARY)}/${slug}`,
      modified
    )
  );

  res.setHeader("Content-Type", "text/xml");
  res.write(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${baseUrl}/</loc>
      <lastmod>${new Date(latestPost).toISOString()}</lastmod>
      <priority>0.8</priority>
    </url>
    ${pages.concat(staticPages, glossaryPages).join("")}
  </urlset>
`);
  res.end();
}

/**
 * Transform url into a sitemap entry
 * @param {string} url
 * @param {Date} date
 * @param {number} priority
 */
function toUrlEntry(url, date = new Date().toISOString(), priority = 0.5) {
  return `
  <url>
    <loc>${url}</loc>
    <lastmod>${date}</lastmod>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * count all the available and published documents
 * @param {*} sources
 */
async function getNbtotalDocuments(sources) {
  const gqlCountDocument = `
query countDocuments($sources: [String!]!) {
  documents_aggregate(where: {is_available:{_eq: true}, is_published: {_eq: true}, source: {_in: $sources }}){
    aggregate {
      count
    }
  }
}
`;
  const response = await client
    .query(gqlCountDocument, {
      sources,
    })
    .toPromise();

  if (response.error) {
    throw response.error;
  }
  return response.data.documents_aggregate.aggregate.count;
}

/**
 * list all the available and published documents
 */
async function getDocuments() {
  const gqlListDocument = `query listDocuments($sources: [String!]!,  $offset: Int = 0, $limit: Int = 50) {
  documents(
    order_by: {cdtn_id: asc},
    limit: $limit
    offset: $offset
    where: {source: {_in: $sources},  is_available: {_eq: true}, is_published: {_eq: true} }) {
    slug
    source
    modified: updated_at
  }
}
`;

  const sources = [
    SOURCES.CDT,
    SOURCES.CONTRIBUTIONS,
    SOURCES.EDITORIAL_CONTENT,
    SOURCES.LETTERS,
    SOURCES.SHEET_MT_PAGE,
    SOURCES.SHEET_SP,
    SOURCES.THEMATIC_FILES,
    SOURCES.TOOLS,
    SOURCES.THEMES,
  ];
  const PAGE_SIZE = 300;
  const limit = pLimit(5);
  const nbDoc = await getNbtotalDocuments(sources);
  const pages = Array.from(
    { length: Math.ceil(nbDoc / PAGE_SIZE) },
    (_, i) => i
  );

  return Promise.all(
    pages.map((page) =>
      limit(() =>
        client
          .query(gqlListDocument, {
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
            sources,
          })
          .toPromise()
          .then(({ data, error }) => {
            if (error) {
              throw error;
            }
            return data.documents;
          })
      )
    )
  );
}

async function getGlossary() {
  const gqlListGlossryTerm = `query getGlossary {
  glossary(order_by: {slug: asc}) {
    slug, modified: updated_at
  }
}`;
  const terms = await client.query(gqlListGlossryTerm).toPromise();
  if (terms.error) {
    throw terms.error;
  }
  return terms.data.glossary;
}
