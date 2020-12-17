import { Client } from "@elastic/elasticsearch";
import { client as gqlClient } from "@shared/graphql-client";
import { SOURCES } from "@socialgouv/cdtn-sources";
import memoizee from "memoizee";
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

export default async function (req, res) {
  const { data } = req.body.input;

  if (
    req.headers["preview-secret"] !== process.env.PUBLICATION_SECRET ||
    !process.env.ELASTICSEARCH_APIKEY_DEV ||
    !process.env.ELASTICSEARCH_URL_DEV
  ) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Missing secret or env",
      statusCode: "403",
    });
  }

  const glossary = await fetchGlossary();

  const client = new Client({
    auth: {
      apiKey: process.env.ELASTICSEARCH_APIKEY_DEV,
    },
    node: `${process.env.ELASTICSEARCH_URL_DEV}`,
  });

  try {
    await client.update({
      body: {
        doc: await transform(data.source, data.document, glossary),
      },
      id: data.cdtnId,
      index: `cdtn-preprod_documents`,
    });
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
