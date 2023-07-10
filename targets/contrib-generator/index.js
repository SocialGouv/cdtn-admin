import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Client } from "@elastic/elasticsearch";

const client = new Client({ node: "http://localhost:9200" });

import fs from "fs";

// const context = `Le code du travail prévoit que le salarié bénéficie de congés à l’occasion de certains événements familiaux. Ils n’entrainent aucune diminution de la rémunération du salarié.

// La durée de ces congés dépend de l’événement familial concerné :

// Pour son mariage ou la conclusion d'un pacte civil de solidarité (Pacs) : 4 jours ;

// Pour le mariage d'un enfant : 1 jour ;

// À noter :

// Ce congé pour mariage est accordé qu’il s’agisse d’un premier mariage ou d’un remariage.

// Le congé pour mariage d’un enfant n’est pas accordé au conjoint qui n'a pas de lien de parenté direct avec l'enfant qui se marie (ex : mariage d'un enfant de son conjoint).

// Pour la naissance d'un ou plusieurs enfants : 3 jours ;
// Cette période de congés commence à courir, au choix du salarié, le jour de la naissance de l'enfant ou le premier jour ouvrable qui suit. Ces jours d'absence bénéficient au père, au conjoint ou au concubin de la mère ou à la personne liée à elle par un Pacs. Ils ne se cumulent pas avec les congés accordés pour ce même enfant dans le cadre du congé de maternité ;

// Pour le décès d'un enfant : 5 jours pour le décès d'un enfant ou :

// 7 jours ouvrés si l'enfant est âgé de moins de 25 ans ;

// 7 jours ouvrés, quel que soit son âge, si l'enfant décédé était lui-même parent ;

// 7 jours ouvrés, en cas de décès d'une personne âgée de moins de 25 ans à la charge effective et permanente du salarié ;

// En outre, le salarié a droit, en plus, à un congé de deuil de 8 jours en cas de décès de son enfant âgé de moins de 25 ans ou d'une personne âgée de moins de 25 ans à sa charge effective et permanente. Ce congé de deuil peut être pris dans un délai d'un an à compter du décès de l'enfant.

// Pour le décès du conjoint, du concubin ou du partenaire lié par un pacte civil de solidarité (Pacs), du père, de la mère, du beau-père, de la belle-mère, d'un frère ou d'une sœur : 3 jours ;`;

// const context = `Le code du travail n'impose pas à l'employeur d’informer les salariés des postes créés ou qui se libèrent dans l’entreprise, sauf dans les cas suivants :

// Le salarié à temps partiel qui souhaite occuper un emploi d'une durée au moins égale à 24 heures ou un emploi à temps plein. Ce salarié bénéficie d’une priorité pour l’attribution d’un emploi dans la même catégorie professionnelle ou d’un emploi équivalent. L’employeur doit l’informer des postes libres correspondants.

// Le salarié à temps plein qui souhaite occuper un emploi à temps partiel. Ce salarié bénéficie d’une priorité pour l’attribution d’un emploi dans la même catégorie professionnelle ou d’un emploi équivalent. L’employeur doit l’informer des postes libres correspondants.

// Le salarié en télétravail qui souhaite occuper ou reprendre un poste sans télétravail. L’employeur doit l’informer des postes disponibles et lui donner la priorité s’il se porte candidat.

// L'employeur informe les salariés en CDD ou en contrat de mission (intérim) de la liste des postes à pourvoir dans l'entreprise par des CDI, si un tel dispositif d'information existe déjà pour les salariés en CDI.`;

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
  console.log(contents.length);

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
