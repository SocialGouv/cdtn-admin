import { Client } from "@elastic/elasticsearch";
import { Boom } from "@hapi/boom";
import { client as gqlClient } from "@shared/graphql-client";
import { SOURCES } from "@socialgouv/cdtn-sources";
import memoizee from "memoizee";
import { apiError } from "src/lib/apiError";
import { markdownTransform } from "src/lib/preview/markdown";

const getGlossary = `
query getGlossary {
  glossary(order_by: {term: asc}) {
    abbreviations
    definition
    id
    references
    term
    variants
  }
}
`;

async function _fetchGlossary() {
  const result = await gqlClient.query(getGlossary).toPromise();
  if (result.error) {
    console.error("[fetchGlossary]", result.error);
    throw result.error;
  }
  return result.data.glossary;
}
const fetchGlossary = memoizee(_fetchGlossary, {
  maxAge: 1000 * 5 * 60,
  preFetch: true,
  promise: true,
});

export const [
  majorIndexVersion,
] = require("../../../../package.json").version.split(".");

export default async function updateDocument(req, res) {
  console.log("update document", req.body.input.cdtnId);
  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  const { cdtnId, document, source } = req.body.input;
  if (
    req.headers["actions-secret"] !== process.env.ACTIONS_SECRET ||
    !process.env.ELASTICSEARCH_TOKEN_UPDATE ||
    !process.env.ELASTICSEARCH_URL
  ) {
    if (req.headers["actions-secret"] !== process.env.ACTIONS_SECRET)
      console.error("actions-secret not match");
    if (!process.env.ELASTICSEARCH_TOKEN_UPDATE)
      console.error("no ELASTICSEARCH_TOKEN_UPDATE");
    if (!process.env.ELASTICSEARCH_URL) console.error("no ELASTICSEARCH_URL");
    return res.status(403).json({
      error: "Forbidden",
      message: "Missing secret or env",
      statusCode: "403",
    });
  }

  const glossary = await fetchGlossary();

  const client = new Client({
    auth: {
      apiKey: process.env.ELASTICSEARCH_TOKEN_UPDATE,
    },
    node: `${process.env.ELASTICSEARCH_URL}`,
  });

  try {
    await client.update({
      body: {
        doc: await transform(source, document, glossary),
      },
      id: cdtnId,
      index: `cdtn-preprod-v${majorIndexVersion}_documents`,
    });
    console.log(
      `update document in index cdtn-preprod-v${majorIndexVersion}_documents`
    );
    res.json({ message: "doc updated!", statusCode: 200 });
  } catch (response) {
    if (response.body) {
      console.error(response.body.error);
    } else {
      console.error(response);
    }
    res
      .status(response.statusCode)
      .json({ message: response.body.error, statusCode: response.statusCode });
  }
}

async function transform(source, document, glossary) {
  switch (source) {
    case SOURCES.EDITORIAL_CONTENT:
      return markdownTransform(glossary, document);
    default:
      return document;
  }
}
