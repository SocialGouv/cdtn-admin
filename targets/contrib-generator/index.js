import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Client } from "@elastic/elasticsearch";

const client = new Client({ node: "http://localhost:9200" });

import fs from "fs";

export const runtime = "edge";

async function generateJson(model, { slug, text: context, title }) {
  const prompt = PromptTemplate.fromTemplate(
    `
      Vous êtes un générateur de JSON. Utilisez uniquement les éléments de contexte et du schéma pour répondre à la question.
      Votre réponse doit uniquement être en français et en json.
      La réponse doit ressemblait à un arbre de décision, en fonction de la réponse 'oui' ou 'non' les feuilles de l'arbre doivent correspondre au nombre de jours de congés.
      Le json doit suivre le schéma suivant: {scheme}

      Le contenu à utiliser pour la génération est le suivant : {context}
    `
  );

  const chain = new LLMChain({
    llm: model,
    prompt,
  });

  const { text } = await chain.call({
    context,
    scheme: `
  {
    "question": {
      "text": "la question sous forme de texte",
      "responses": [{
        "text": "la réponse sous forme de texte",
        "question": {
          "text": "la question sous forme de texte"
          "responses: [{
            "text": "la réponse sous forme de texte",
            "result": répondre à ${title} sous forme de texte
          }]
        }
      }]
      }
    }
  }
  `,
  });
  console.log(slug, text);

  fs.writeFileSync(`./data/${slug}.json`, text);
  return text;
}

async function main() {
  const result = await client.search({
    index: "cdtn_documents",
    body: {
      query: {
        match: {
          source: "contributions",
        },
      },
    },
  });
  const contents = result.body.hits.hits.slice(0, 10).map(({ _source }) => ({
    slug: _source.slug,
    text: _source.answers.generic.text,
    title: _source.title,
  }));

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo-16k-0613",
    temperature: 0.5,
  });

  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }

  await Promise.all(contents.map((content) => generateJson(model, content)));
}

main();
