import { gqlClient } from "@shared/utils";
import { getRouteBySource, SourceKeys, SOURCES } from "@socialgouv/cdtn-utils";
import { NextApiRequest, NextApiResponse } from "next";
import pLimit from "p-limit";
import {
  formatDateToCustomISO,
  transformStringDate,
} from "src/modules/sitemap/date";

export type Document = {
  updated_at: string;
  slug: string;
  source: SourceKeys;
  document: any;
};

const slugStartsWithNumber = (slug: string) => {
  const [firstElement] = slug.split("-");
  return !isNaN(parseInt(firstElement));
};

const findCCSlug = (
  idcc: string,
  documents: Document[]
): string | undefined => {
  const idccNum = parseInt(idcc);
  return documents.find((doc) => {
    return doc.source === SOURCES.CCN && doc.document.num === idccNum;
  })?.slug;
};

// URL publique de l'image d'une actualité, comme sur le site : le nom du
// fichier, sans dossier, sous `imageBaseUrl`.
const newsImageUrl = (doc: Document, imageBaseUrl?: string) => {
  const filename: string | undefined = doc.document?.image?.filename;
  if (!imageBaseUrl || doc.source !== SOURCES.NEWS || !filename) return;
  return `${imageBaseUrl}/${filename.substring(filename.lastIndexOf("/") + 1)}`;
};

// Pages de liste : leur lastmod est la date du contenu le plus récent de leur
// rubrique. Les autres pages fixes n'ont pas de lastmod, Google ignorant tous
// les lastmod d'un site quand ils ne sont pas fiables.
const LISTING_SOURCES: Record<string, SourceKeys> = {
  "/modeles-de-courriers": SOURCES.LETTERS,
  "/outils": SOURCES.TOOLS,
  "/contribution": SOURCES.CONTRIBUTIONS,
  "/themes": SOURCES.THEMES,
  "/convention-collective": SOURCES.CCN,
  "/infographie": SOURCES.INFOGRAPHICS,
  "/actualite": SOURCES.NEWS,
};

const latest = (a: Date | undefined, b: Date) =>
  a && a.getTime() >= b.getTime() ? a : b;

export async function toUrlEntries(
  documents: Document[],
  glossaryTerms: Document[],
  baseUrl: string,
  imageBaseUrl?: string
) {
  let latestPostDate = new Date("2020-01-01");
  const latestBySource: Partial<Record<SourceKeys, Date>> = {};

  const pages = documents.flat().map((doc) => {
    const displayed = doc.document?.date
      ? transformStringDate(doc.document.date)
      : new Date(doc.updated_at);
    const modified = doc.document?.updatedAt
      ? new Date(doc.document.updatedAt)
      : undefined;
    const date =
      modified && !isNaN(modified.getTime()) && modified > displayed
        ? modified
        : displayed;
    if (date.getTime() > latestPostDate.getTime()) {
      latestPostDate = date;
    }
    latestBySource[doc.source] = latest(latestBySource[doc.source], date);
    const source = getRouteBySource(doc.source);
    const priority =
      source === "information" ||
      source === "modeles-de-courriers" ||
      (source === "contribution" && !slugStartsWithNumber(doc.slug))
        ? 0.7
        : 0.5;
    let projectURL = `${baseUrl}/${source}/${doc.slug}`;
    if (
      doc.document.questionIndex === 50 &&
      source === "contribution" &&
      doc.document.idcc !== "0000"
    ) {
      const slugAfterFirstDash = doc.slug.slice(doc.slug.indexOf("-") + 1);
      projectURL = `${baseUrl}/${source}/${slugAfterFirstDash}/${findCCSlug(doc.document.idcc, documents.flat()) ?? doc.document.idcc}`;
    }
    return toUrlEntry(
      projectURL,
      date,
      priority,
      newsImageUrl(doc, imageBaseUrl)
    );
  });

  const glossaryPages = glossaryTerms.map(({ slug, updated_at }) =>
    toUrlEntry(
      `${baseUrl}/${getRouteBySource(SOURCES.GLOSSARY)}/${slug}`,
      new Date(updated_at)
    )
  );
  const latestGlossaryDate = glossaryTerms.reduce<Date | undefined>(
    (acc, { updated_at }) => latest(acc, new Date(updated_at)),
    undefined
  );

  const staticPages = [
    `/a-propos`,
    `/droit-du-travail`,
    `/mentions-legales`,
    `/politique-confidentialite`,
    `/integration`,
    `/modeles-de-courriers`,
    `/outils`,
    `/glossaire`,
    `/quoi-de-neuf`,
    `/contribution`,
    `/themes`,
    `/convention-collective`,
    `/infographie`,
    "/actualite",
  ].map((path) =>
    toUrlEntry(
      `${baseUrl}${path}`,
      path === "/glossaire"
        ? latestGlossaryDate
        : LISTING_SOURCES[path] && latestBySource[LISTING_SOURCES[path]]
    )
  );

  return { latestPostDate, glossaryPages, pages, staticPages };
}

export default async function Sitemap(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const baseUrl =
    (req.query.baseurl as string) || "https://code.travail.gouv.fr";
  const documents = await getDocuments();
  const glossaryTerms = await getGlossary();

  const { latestPostDate, pages, staticPages, glossaryPages } =
    await toUrlEntries(
      documents,
      glossaryTerms,
      baseUrl,
      getImageBaseUrl(req.query.bucketfolder)
    );

  res.setHeader("Content-Type", "text/xml");
  res.write(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><url><loc>${baseUrl}/</loc><lastmod>${formatDateToCustomISO(
      latestPostDate
    )}</lastmod><priority>0.8</priority></url>${pages
      .concat(staticPages, glossaryPages)
      .join("")}</urlset>`
  );
  res.end();
}

// Dossier public du bucket (`published` ou `preview`) passé par l'export : les
// images des actualités y sont servies sous le dossier par défaut, comme sur le
// site. Sans dossier, le sitemap ne liste pas d'image.
export function getImageBaseUrl(bucketFolder: unknown): string | undefined {
  if (typeof bucketFolder !== "string" || !/^[\w-]+$/.test(bucketFolder)) {
    return;
  }
  return `${
    process.env.NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT ?? "http://localhost:9000"
  }/${bucketFolder}/${process.env.NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER ?? "default"}`;
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

function toUrlEntry(
  url: string,
  date?: Date,
  priority = 0.5,
  imageUrl?: string
) {
  return `<url><loc>${escapeXml(url)}</loc>${
    date ? `<lastmod>${formatDateToCustomISO(date)}</lastmod>` : ""
  }<priority>${priority}</priority>${
    imageUrl
      ? `<image:image><image:loc>${escapeXml(imageUrl)}</image:loc></image:image>`
      : ""
  }</url>`;
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
    SOURCES.INFOGRAPHICS,
    SOURCES.NEWS,
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
