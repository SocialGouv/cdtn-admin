import { injectable } from "inversify";
import { name } from "../utils";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BaseLanguageModel } from "langchain/base_language";
import { Chroma } from "langchain/vectorstores/chroma";

@injectable()
@name("ChatService")
export class ChatService {
  model: BaseLanguageModel;
  private QA_PROMPT = `Vous êtes un assistant juridique. Utilisez uniquement les éléments de contexte pour répondre à la question.
  Votre réponse doit uniquement être en français.
  Si vous ne connaissez pas la réponse, dites simplement que vous ne savez pas. N'essayez PAS d'inventer une réponse.
  Si la question n'est pas liée au contexte, répondez poliment que vous êtes réglé pour répondre uniquement aux questions liées au contexte.
  S'il vous manque des éléments de contexte, demandez à l'utilisateur de vous les fournir dans le cas où il y a plusieurs réponses possibles.
  N'hésitez pas à donner des examples pour agrémenter votre réponse.
  {context}
  Question: {question}
  `;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true,
      modelName: "gpt-3.5-turbo-16k-0613",
      temperature: 0.5,
    });
  }

  async ask(question: string, historyMessage: string) {
    const vectorStore = await Chroma.fromExistingCollection(
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      { collectionName: "service-public" }
    );

    const chain = ConversationalRetrievalQAChain.fromLLM(
      this.model,
      vectorStore.asRetriever(),
      {
        returnSourceDocuments: true,
        qaTemplate: this.QA_PROMPT,
      }
    );

    const result = await chain.call({
      question,
      chat_history: historyMessage,
    });

    return result;
  }
}
