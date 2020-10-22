import { client } from "@shared/graphql-client";
import { SOURCES } from "@socialgouv/cdtn-sources";
import fetch from "node-fetch";
import pAll from "p-all";

// query outils
const toolsQuery = `
query ToolsQuery {
  documents(where: {
    source: {_eq: "${SOURCES.TOOLS}"}
  }) {
    cdtn_id,
    source,
    document
  }
}
`;

// remove some garbage from legifrance urls
const cleanUrl = (url) => {
  if (!url.match(/https?:\/\//)) {
    return null;
  }
  const u = new URL(url);
  const acceptableKeys = [
    "idSectionTA",
    "cidTexte",
    "idConvention",
    "idArticle",
  ];
  const newParams = new URLSearchParams(
    acceptableKeys
      .filter((k) => !!u.searchParams.get(k))
      .reduce((a, c) => ({ ...a, [c]: u.searchParams.get(c) }), {})
  );
  const newUrl = new URL(
    `${u.origin}${u.pathname.replace(/;jsessionid=[^?#]+/, "")}` // remove session keys
  );
  newUrl.search = newParams.toString();

  return newUrl.toString();
};

const isUniqueUrl = (ref, i, allRefs) =>
  !allRefs.slice(0, i).find((r) => r.refUrl === ref.refUrl);

// extract article ID
const getIdFromLegifranceUrl = (url) => {
  if (!url || !url.match(/https?:\/\//)) {
    return null;
  }
  const groups = url.match(/(KALI|LEGI)ARTI\d+/);
  if (groups) {
    return groups[0];
  }
};

function fetchCdtApi(path) {
  const url = `https://cdtn-api.fabrique.social.gouv.fr${path}`;
  return fetch(url)
    .then((r) => r.json())
    .then((rows) => rows[0]);
}

/**
 *
 * @param {import("@socialgouv/contributions-data").Reference} reference
 */
async function getDilaRef(reference) {
  // KALI agreement
  const articleId = getIdFromLegifranceUrl(reference.refUrl);
  if (!articleId) {
    return null;
  }
  if (reference.idcc && reference.idcc != 0) {
    const apiRes = await fetchCdtApi(
      `/agreement/articles?articleIdsOrCids=${articleId}`
    );
    if (!apiRes) {
      return;
    }
    return {
      category: "agreement",
      dila_cid: apiRes.cid,
      dila_container_id: apiRes.containerId,
      dila_id: apiRes.id,
      title: reference.title,
    };
    // LEGI articles
  } else if (reference.refUrl.match(/affichCodeArticle\.do/)) {
    const apiRes = await fetchCdtApi(
      `/code/articles?articleIdsOrCids=${articleId}`
    );

    if (!apiRes) {
      return;
    }
    return {
      category: "labor_code",
      dila_cid: apiRes.cid,
      dila_container_id: apiRes.containerId,
      dila_id: apiRes.id,
      title: reference.title,
    };
  }
}

// extract all references from a given JSON
const extractReferences = async (tool) => {
  const docUrl = tool.document.dataUrl;
  if (!docUrl) {
    return [];
  }
  const doc = await fetch(docUrl).then((r) => r.json());
  // prime-precarite
  if (Array.isArray(doc)) {
    const refs = doc
      .filter((s) => !!s.refUrl && !!s.refLabel)
      .flatMap((situation) => {
        const labels = situation.refLabel.split("\n");
        const urls = situation.refUrl.split("\n");
        return urls
          .map((refUrl, i) => ({
            ref: labels[i].trim(),
            refUrl: cleanUrl(refUrl),
            idcc: situation.idcc,
          }))
          .filter((s) => !!s.refUrl)
          .filter(isUniqueUrl); // uniquify url
      });
    return refs;
    // others
  } else if (Array.isArray(doc.situations)) {
    const refs = doc.situations
      .filter((s) => !!s.refUrl)
      .map((situation) => ({
        ref: situation.ref.trim(),
        refUrl: cleanUrl(situation.refUrl),
        idcc: situation.idcc,
      }))
      .filter((s) => !!s.refUrl)
      .filter(isUniqueUrl); // uniquify url
    return refs;
  }
};

/**
 * @returns { Promise<alerts.Source[]> }
 */
async function getTools() {
  const result = await client.query(toolsQuery).toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error("getTools");
  }
  return result.data.documents;
}

/**
 *
 */
export async function getOutilsReferences() {
  /** @type {alerts.DocumentReferences[]} */
  const outils = await getTools();
  const references = [];

  for (const outil of outils) {
    const toolRefs = await extractReferences(outil);
    references.push({
      document: {
        id: outil.cdtn_id,
        title: outil.document.title,
        type: SOURCES.TOOLS,
      },
      references: await pAll(
        toolRefs.map((ref) => () => getDilaRef(ref)),
        { concurrency: 3 }
      ),
    });
  }

  return references;
}

export default function main() {
  return getOutilsReferences();
}
