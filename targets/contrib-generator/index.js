import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { VectorStoreRetrieverMemory } from "langchain/memory";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import fs from "fs";

const context = `Le code du travail prévoit que le salarié bénéficie de congés à l’occasion de certains événements familiaux. Ils n’entrainent aucune diminution de la rémunération du salarié.

La durée de ces congés dépend de l’événement familial concerné :

Pour son mariage ou la conclusion d'un pacte civil de solidarité (Pacs) : 4 jours ;

Pour le mariage d'un enfant : 1 jour ;

À noter :

Ce congé pour mariage est accordé qu’il s’agisse d’un premier mariage ou d’un remariage.

Le congé pour mariage d’un enfant n’est pas accordé au conjoint qui n'a pas de lien de parenté direct avec l'enfant qui se marie (ex : mariage d'un enfant de son conjoint).

Pour la naissance d'un ou plusieurs enfants : 3 jours ;
Cette période de congés commence à courir, au choix du salarié, le jour de la naissance de l'enfant ou le premier jour ouvrable qui suit. Ces jours d'absence bénéficient au père, au conjoint ou au concubin de la mère ou à la personne liée à elle par un Pacs. Ils ne se cumulent pas avec les congés accordés pour ce même enfant dans le cadre du congé de maternité ;

Pour le décès d'un enfant : 5 jours pour le décès d'un enfant ou :

7 jours ouvrés si l'enfant est âgé de moins de 25 ans ;

7 jours ouvrés, quel que soit son âge, si l'enfant décédé était lui-même parent ;

7 jours ouvrés, en cas de décès d'une personne âgée de moins de 25 ans à la charge effective et permanente du salarié ;

En outre, le salarié a droit, en plus, à un congé de deuil de 8 jours en cas de décès de son enfant âgé de moins de 25 ans ou d'une personne âgée de moins de 25 ans à sa charge effective et permanente. Ce congé de deuil peut être pris dans un délai d'un an à compter du décès de l'enfant.

Pour le décès du conjoint, du concubin ou du partenaire lié par un pacte civil de solidarité (Pacs), du père, de la mère, du beau-père, de la belle-mère, d'un frère ou d'une sœur : 3 jours ;`;

export const runtime = "edge";

async function main() {
  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo-16k-0613",
    temperature: 0.5,
  });

  const prompt = PromptTemplate.fromTemplate(
    `
      Vous êtes un générateur de JSON. Utilisez uniquement les éléments de contexte et du schéma pour répondre à la question.
      Votre réponse doit uniquement être en français et en json.
      La réponse doit ressemblait à un arbre de décision, en fonction de la réponse 'oui' ou 'non' les feuilles de l'arbre doivent correspondre au nombre de jours de congés.
      Le json doit suivre le schéma suivant: {scheme}
      
      Le contenu à utiliser pour la génération est le suivant : {context}
    `
  );

  // const loader = new CheerioWebBaseLoader(
  //   "https://code.travail.gouv.fr/contribution/les-conges-pour-evenements-familiaux"
  // )

  // const docs = await loader.loadAndSplit()
  // const vectorStore = await MemoryVectorStore.fromDocuments(
  //   docs,
  //   new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY })
  // )

  // const memory = new VectorStoreRetrieverMemory({
  //   vectorStoreRetriever: vectorStore.asRetriever(1),
  //   memoryKey: "context",
  // });

  const chain = new LLMChain({
    llm: model,
    prompt,
    // memory
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
            "value": le nombre de congé sous forme de chiffre
          }]
        }
      }]
      }
    }
  }
  `,
  });
  console.log(text);

  fs.writeFileSync("./output.json", text);
}

main();
