import { gqlClient } from "@shared/utils";
import { getRouteBySource, SourceKeys, SOURCES } from "@socialgouv/cdtn-utils";
import { NextApiRequest, NextApiResponse } from "next";
import pLimit from "p-limit";
import {
  formatDateToCustomISO,
  midnightInParis,
  parisDate,
  transformStringDate,
} from "src/modules/sitemap/date";

export type Document = {
  updated_at: string;
  slug: string;
  title?: string;
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

// Nom de la publication tel qu'il apparaît sur les articles (Google Actualités).
const NEWS_PUBLICATION_NAME = "Code du travail numérique";
const NEWS_MAX_AGE_DAYS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

const validDate = (value: unknown): Date | undefined => {
  if (typeof value !== "string") return;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
};

// Balises Google Actualités d'une actualité publiée depuis moins de deux jours
// (Google ignore les plus anciennes). La date de publication est l'instant de
// première publication (`publishedAt`), comme le `datePublished` du front ; à
// défaut, la date affichée à minuit heure de Paris, et la fenêtre compte alors
// en jours calendaires faute d'heure connue.
const newsTags = (
  doc: Document,
  published: Date,
  now: Date,
  exactTime: boolean
) => {
  if (doc.source !== SOURCES.NEWS || !doc.title || isNaN(published.getTime())) {
    return "";
  }
  const today = parisDate(now);
  const since = exactTime
    ? now.getTime() - NEWS_MAX_AGE_DAYS * DAY_MS
    : midnightInParis({
        ...today,
        day: today.day - NEWS_MAX_AGE_DAYS,
      }).getTime();
  if (published.getTime() < since || published.getTime() > now.getTime()) {
    return "";
  }
  return `<news:news><news:publication><news:name>${NEWS_PUBLICATION_NAME}</news:name><news:language>fr</news:language></news:publication><news:publication_date>${formatDateToCustomISO(
    published
  )}</news:publication_date><news:title>${escapeXml(
    doc.title
  )}</news:title></news:news>`;
};

const imageTag = (imageUrl?: string) =>
  imageUrl
    ? `<image:image><image:loc>${escapeXml(imageUrl)}</image:loc></image:image>`
    : "";

export async function toUrlEntries(
  documents: Document[],
  glossaryTerms: Document[],
  baseUrl: string,
  { imageBaseUrl, now = new Date() }: { imageBaseUrl?: string; now?: Date } = {}
) {
  let latestPostDate = new Date("2020-01-01");
  const latestBySource: Partial<Record<SourceKeys, Date>> = {};

  const pages = documents.flat().map((doc) => {
    // Instant de première publication d'une actualité, sinon date affichée
    // (minuit Paris) ; une date invalide retombe sur la mise à jour du
    // document. `lastmod` est la plus récente de ces dates, de la date
    // affichée (jour de la dernière publication) et de `updatedAt`.
    const publishedAt = validDate(doc.document?.publishedAt);
    const displayDate =
      typeof doc.document?.date === "string"
        ? transformStringDate(doc.document.date)
        : undefined;
    const displayed = publishedAt || displayDate || new Date(doc.updated_at);
    const date = latest(
      validDate(doc.document?.updatedAt),
      latest(displayDate, displayed)
    );
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
      imageTag(newsImageUrl(doc, imageBaseUrl)) +
        newsTags(doc, displayed, now, !!publishedAt)
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
    await toUrlEntries(documents, glossaryTerms, baseUrl, {
      imageBaseUrl: getImageBaseUrl(req.query.bucketfolder),
    });

  res.setHeader("Content-Type", "text/xml");
  res.write(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${toUrlEntry(
      `${baseUrl}/`,
      latestPostDate,
      0.8
    )}${pages.concat(staticPages, glossaryPages).join("")}</urlset>`
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

// `extensions` : balises image et news déjà échappées.
function toUrlEntry(url: string, date?: Date, priority = 0.5, extensions = "") {
  return `<url><loc>${escapeXml(url)}</loc>${
    date ? `<lastmod>${formatDateToCustomISO(date)}</lastmod>` : ""
  }<priority>${priority}</priority>${extensions}</url>`;
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
        title
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
