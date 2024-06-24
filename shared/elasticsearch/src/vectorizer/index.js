const { stopwords: semantic_stopwords } = require("../dataset/stop_words");

function stripAccents(text) {
  // strip accents
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const stopWords = new Set(semantic_stopwords.map(stripAccents));

function preprocess(text) {
  const stripped = stripAccents(text);

  // 09/06/20 : cheap tokenizer, we should probably use something more solid
  // keep it like this for now to ensure embedding stability despite refactoring
  const split = stripped.split(" ");

  // remove stop words
  const noStopWords = split.filter((t) => !stopWords.has(t.toLowerCase()));

  return noStopWords.join(" ");
}

module.exports = { preprocess };
