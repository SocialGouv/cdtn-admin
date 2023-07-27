import { inject, injectable } from "inversify";
import { getName, name } from "../utils";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BaseLanguageModel } from "langchain/base_language";
import { Chroma } from "langchain/vectorstores/chroma";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { CollectionSlug } from "../type";
import { EmbeddingService } from "./embedding";
import { ValidatorChatType } from "../controllers/middlewares";

@injectable()
@name("ChatService")
export class ChatService {
  model: BaseLanguageModel;
  openai: OpenAIApi;
  private QA_PROMPT_SP = `Vous êtes un assistant juridique. Utilisez uniquement les éléments de "CONTEXT" pour répondre à la question.
  Votre réponse doit uniquement être en français.
  Si vous ne connaissez pas la réponse, dites simplement que vous ne savez pas. N'essayez PAS d'inventer une réponse.
  Si la question n'est pas liée au CONTEXT, répondez poliment que vous êtes réglé pour répondre uniquement aux questions liées au savoir acquis.
  S'il vous manque des éléments de CONTEXT, demandez à l'utilisateur de vous les fournir dans le cas où il y a plusieurs réponses possibles.
  N'hésitez pas à donner des examples pour agrémenter votre réponse. De plus, n'hésite pas à reformuler la réponse pour la rendre plus claire.
  Vous reconnaîtrez le CONTEXT car il sera sous forme de json et précédé de ce mot clé : CONTEXT.
  `;
  private QA_PROMPT_CONTRIBUTION = `Vous êtes un assistant juridique. Utilisez uniquement les éléments de "CONTEXT GENERIC" et "CONTEXT IDCC" pour répondre à la question.
  Votre réponse doit uniquement être en français.
  Si vous ne connaissez pas la réponse, dites simplement que vous ne savez pas. N'essayez PAS d'inventer une réponse.
  Si la question n'est pas liée au CONTEXT GENERIC ou / et CONTEXT IDCC, répondez poliment que vous êtes réglé pour répondre uniquement aux questions liées au savoir acquis.
  S'il vous manque des éléments de CONTEXT GENERIC ou / et CONTEXT IDCC, demandez à l'utilisateur de vous les fournir dans le cas où il y a plusieurs réponses possibles.
  N'hésitez pas à donner des examples pour agrémenter votre réponse. De plus, n'hésite pas à reformuler la réponse pour la rendre plus claire.
  Vous reconnaîtrez le CONTEXT GENERIC car il sera sous forme de json et précédé de ce mot clé : CONTEXT GENERIC.
  Vous reconnaîtrez le CONTEXT IDCC car il sera sous forme de json et précédé de ce mot clé : CONTEXT IDCC.
  Essayez de rendre la conversation interactive en posant des questions.
  Lorsque le numéro de la convention collectif est acquis, c'est le CONTEXT IDCC qui doit être utilisé pour répondre à la question. Le CONTEXT IDCC est donc prioritaire sur le CONTEXT GENERIC.
  `;
  // private CONDENSE_PROMPT = `Compte tenu de la conversation suivante et d'une question de suivi, reformulez la question de suivi pour en faire une question autonome.
  // Historique du chat:
  // {chat_history}
  // Entrée de suivi: {question}
  // Question autonome:
  // `;
  // private QA_PROMPT_CONTRIB = `Vous êtes un assistant juridique. Utilisez uniquement les éléments de contexte pour répondre à la question.
  // Votre réponse doit uniquement être en français.
  // Si vous ne connaissez pas la réponse, dites simplement que vous ne savez pas. N'essayez PAS d'inventer une réponse.
  // Si la question n'est pas liée au contexte, répondez poliment que vous êtes réglé pour répondre uniquement aux questions liées au savoir acquis.
  // S'il vous manque des éléments de contexte, demandez à l'utilisateur de vous les fournir dans le cas où il y a plusieurs réponses possibles.
  // N'hésitez pas à donner des examples pour agrémenter votre réponse. De plus, n'hésite pas à reformuler la réponse pour la rendre plus claire.
  // De plus, indiquez à l'utilisateur de compléter le numéro de sa convention collective afin d'affiner sa réponse.
  // Enfin, essayer de rentre la conversation interactive en posant des questions liées au contexte.
  // {context}
  // Question: {question}
  // `;

  constructor(
    @inject(getName(EmbeddingService))
    private readonly embedding: EmbeddingService
  ) {
    this.model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true,
      modelName: "gpt-3.5-turbo-16k-0613",
      temperature: 0,
    });
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async askServicePublic(body: ValidatorChatType) {
    const question = body.question;
    const historyMessage = body.history;
    const messages = [
      {
        role: "system",
        content: this.QA_PROMPT_SP,
      },
      ...historyMessage,
      {
        role: "user",
        content: question,
      },
    ] as ChatCompletionRequestMessage[];

    const allUserMessages = messages.reduce((acc, message) => {
      if (message.role === "user") {
        return acc + "\n\n" + message.content;
      }
      return acc;
    }, "");

    const documents = await this.embedding.getServicePublicDocuments(
      allUserMessages,
      5
    );

    messages.push({
      content: "CONTEXT : " + JSON.stringify(documents),
      role: "system",
    });

    const answer = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k-0613",
      temperature: 0,
      messages,
    });

    return {
      text: answer.data.choices[0].message?.content ?? "",
      sourceDocuments: documents,
    } as any;
  }

  async askContribution(body: ValidatorChatType) {
    const question = body.question;
    const historyMessage = body.history;
    const messages = [
      {
        role: "system",
        content: this.QA_PROMPT_CONTRIBUTION,
      },
      ...historyMessage,
      {
        role: "user",
        content: question,
      },
    ] as ChatCompletionRequestMessage[];

    const allUserMessages = messages.reduce((acc, message) => {
      if (message.role === "user") {
        return acc + "\n\n" + message.content;
      }
      return acc;
    }, "");

    const documentsGeneric =
      await this.embedding.getContributionGenericDocuments(allUserMessages, 10);

    const documentsIdcc = body.idcc
      ? await this.embedding.getContributionIdccDocuments(
          allUserMessages,
          5,
          body.idcc
        )
      : [];

    messages.push({
      content: "CONTEXT GENERIC: " + JSON.stringify(documentsGeneric),
      role: "system",
    });

    messages.push({
      content: "CONTEXT IDCC: " + JSON.stringify(documentsIdcc),
      role: "system",
    });

    const answer = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k-0613",
      temperature: 0,
      messages,
    });

    return {
      text: answer.data.choices[0].message?.content ?? "",
      sourceDocuments: [...documentsGeneric, ...documentsIdcc],
    } as any;
  }

  // async askContribution(question: string, historyMessage: string) {
  //   const vectorStore = await Chroma.fromExistingCollection(
  //     new OpenAIEmbeddings({
  //       openAIApiKey: process.env.OPENAI_API_KEY,
  //     }),
  //     { collectionName: CollectionSlug.CONTRIBUTION_GENERIC }
  //   );

  //   const chain = ConversationalRetrievalQAChain.fromLLM(
  //     this.model,
  //     vectorStore.asRetriever(10),
  //     {
  //       returnSourceDocuments: true,
  //       qaTemplate: this.QA_PROMPT_CONTRIB,
  //       questionGeneratorTemplate: this.CONDENSE_PROMPT,
  //     }
  //   );

  //   const result = await chain.call({
  //     question,
  //     chat_history: historyMessage,
  //   });

  //   return result;
  // }
}
