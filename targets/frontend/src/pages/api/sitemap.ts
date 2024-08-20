import { gqlClient } from "@shared/utils";
import {
  getRouteBySource,
  SourceRoute,
  SOURCES,
} from "@socialgouv/cdtn-sources";
import { NextApiRequest, NextApiResponse } from "next";
import pLimit from "p-limit";

export type Document = {
  updated_at: string;
  slug: string;
  source: SourceRoute;
  document: any;
};

const slugStartsWithNumber = (slug: string) => {
  const [firstElement] = slug.split("-");
  return !isNaN(parseInt(firstElement));
};

export async function toUrlEntries(
  documents: Document[],
  glossaryTerms: Document[],
  baseUrl: string
) {
  let latestPostDate = new Date("2020-01-01");

  const pages = documents.flat().map((doc) => {
    const date = doc.document?.date
      ? new Date(doc.document.date)
      : new Date(doc.updated_at);
    if (date.getTime() > latestPostDate.getTime()) {
      latestPostDate = date;
    }
    const source = getRouteBySource(doc.source);
    const priority =
      source === "information" ||
      source === "modeles-de-courriers" ||
      (source === "contribution" && !slugStartsWithNumber(doc.slug))
        ? 0.7
        : 0.5;
    const projectURL = `${baseUrl}/${source}/${doc.slug}`;
    return toUrlEntry(projectURL, date, priority);
  });

  const staticPages = [
    `/a-propos`,
    `/droit-du-travail`,
    `/mentions-legales`,
    `/politique-confidentialite`,
    `/integration`,
    `/modeles-de-courriers`,
    `/outils`,
    `/glossaire`,
  ].map((path) => toUrlEntry(`${baseUrl}${path}`, latestPostDate));

  const glossaryPages = glossaryTerms.map(({ slug, updated_at }) =>
    toUrlEntry(
      `${baseUrl}/${getRouteBySource(SOURCES.GLOSSARY)}/${slug}`,
      new Date(updated_at)
    )
  );
  return { latestPostDate, glossaryPages, pages, staticPages };
}

export default async function Sitemap(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[/api/sitemap]", " request: ", req.query);
  const startProcessAt = process.hrtime();
  const baseUrl =
    (req.query.baseurl as string) || "https://code.travail.gouv.fr";
  const documents = await getDocuments();
  const glossaryTerms = await getGlossary();

  const { latestPostDate, pages, staticPages, glossaryPages } =
    await toUrlEntries(documents, glossaryTerms, baseUrl);

  res.setHeader("Content-Type", "text/xml");
  res.write(`
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>${baseUrl}/</loc><lastmod>${formatDateToCustomISO(
    latestPostDate
  )}</lastmod><priority>0.8</priority></url>
      ${pages.concat(staticPages, glossaryPages).join("")}
    </urlset>
  `);
  res.end();
  const endProcess = process.hrtime(startProcessAt);
  console.log("[/api/sitemap]", " end in ", endProcess);
}

function toUrlEntry(url: string, date: Date, priority = 0.5) {
  return `<url><loc>${url}</loc><lastmod>${formatDateToCustomISO(
    date
  )}</lastmod><priority>${priority}</priority></url>`;
}

function formatDateToCustomISO(date: Date): string {
  const pad = (num: number) => (num < 10 ? "0" : "") + num;

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
}

/**
 * count all the available and published documents
 * @param {*} sources
 */
async function getNbTotalDocuments(sources: string[]) {
  const gqlCountDocument = `
    query countDocuments($sources: [String!]!) {
      documents_aggregate(
        where: {
          is_available: { _eq: true }
          is_published: { _eq: true }
          source: { _in: $sources }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;
  const response = await gqlClient()
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
  const gqlListDocument = `
    query listDocuments(
      $sources: [String!]!
      $offset: Int = 0
      $limit: Int = 50
    ) {
      documents(
        order_by: [{ source: asc }, { slug: asc }]
        limit: $limit
        offset: $offset
        where: {
          source: { _in: $sources }
          is_available: { _eq: true }
          is_published: { _eq: true }
          _not: { document: { _contains: { displayTool: false } } }
        }
      ) {
        slug
        source
        updated_at
        document
      }
    }
  `;

  const sources = [
    SOURCES.CDT,
    SOURCES.CCN,
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
  const nbDoc = await getNbTotalDocuments(sources);
  const pages = Array.from(
    { length: Math.ceil(nbDoc / PAGE_SIZE) },
    (_, i) => i
  );

  return Promise.all(
    pages.map((page) =>
      limit(() =>
        gqlClient()
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
    slug, updated_at
  }
}`;
  const terms = await gqlClient().query(gqlListGlossryTerm, {}).toPromise();
  if (terms.error) {
    throw terms.error;
  }
  return terms.data.glossary;
}
