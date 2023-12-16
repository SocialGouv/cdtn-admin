// vectorizer is imported by code-du-travail-api which is using CommonJS, and throwing an exception
// when requiring code-du-travail-data ES module, thus we keep using CommonJS import here
const got = require("got");
const { stopwords: semantic_stopwords } = require("../dataset/stop_words");

// URL of the TF serve deployment
const NLP_URL =
  process.env.NLP_URL || "https://serving-ml.fabrique.social.gouv.fr";
console.log("NLP URL:", NLP_URL);
const tfServeURL = NLP_URL + "/v1/models/sentqam:predict";

function stripAccents(text) {
  // strip accents
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const stopWords = new Set(semantic_stopwords.map(stripAccents));

const cache = new Map();

function preprocess(text) {
  const stripped = stripAccents(text);

  // 09/06/20 : cheap tokenizer, we should probably use something more solid
  // keep it like this for now to ensure embedding stability despite refactoring
  const split = stripped.split(" ");

  // remove stop words
  const noStopWords = split.filter((t) => !stopWords.has(t.toLowerCase()));

  return noStopWords.join(" ");
}

async function callTFServe(json) {
  const response = await got.post(tfServeURL, {
    cache,
    json,
    responseType: "json",
    retry: {
      limit: 15,
      methods: ["POST"],
    },
  });
  return response.body["outputs"];
}

async function vectorizeDocument(title, content) {
  if (title == undefined || title == "") {
    throw new Error("Cannot vectorize document with empty title.");
  }

  const input = [preprocess(title)];
  const context = content ? [preprocess(content)] : "";

  const body = {
    inputs: { context, input },
    signature_name: "response_encoder",
  };
  const vectors = await callTFServe(body);

  return vectors[0];
}

async function vectorizeQuery(query) {
  if (!query) {
    throw new Error("Cannot vectorize empty query.");
  }

  const inputs = [preprocess(query)];
  const body = {
    inputs,
    signature_name: "question_encoder",
  };
  const vectors = await callTFServe(body);
  return vectors[0];
}

module.exports = { preprocess, vectorizeDocument, vectorizeQuery };
