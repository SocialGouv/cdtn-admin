import { inject, injectable } from "inversify";

import { getName, name, wait } from "../utils";
import { DocumentsRepository } from "../repositories";
import { SOURCES } from "@socialgouv/cdtn-utils";
import {
  ChromaClient,
  IEmbeddingFunction,
  OpenAIEmbeddingFunction,
} from "chromadb";

@injectable()
@name("EmbeddingService")
export class EmbeddingService {
  client: ChromaClient;
  embedder: IEmbeddingFunction;
  private SERVICE_PUBLIC_COLLECTION = "service-public";

  constructor(
    @inject(getName(DocumentsRepository))
    private readonly documentsRepository: DocumentsRepository
  ) {
    this.client = new ChromaClient();
    this.embedder = new OpenAIEmbeddingFunction({
      openai_api_key: process.env.OPENAI_API_KEY!,
    });
  }

  // TODO: this code is working only for the first 75 documents because there is a limit in EmbeddingFunction
  async ingestServicePublicDocuments() {
    const BATCH_SIZE = 5;
    const results = await this.documentsRepository.getBySource(
      SOURCES.SHEET_SP
    );
    const collection = await this.client.getOrCreateCollection({
      name: this.SERVICE_PUBLIC_COLLECTION,
      embeddingFunction: this.embedder,
    });
    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);
      const ids = batch.map((r) => r.cdtnId);
      const documents = batch.map((r) => r.text);
      const metadatas = batch.map((r) => ({
        title: r.title,
        metaDescription: r.metaDescription,
      }));
      await collection.upsert({
        ids,
        metadatas,
        documents,
      });
      await wait(1000);
    }

    return { result: "Service public ingested" };
  }

  async getServicePublicDocuments(query: string) {
    const collection = await this.client.getOrCreateCollection({
      name: this.SERVICE_PUBLIC_COLLECTION,
      embeddingFunction: this.embedder,
    });
    const result = await collection.query({
      queryTexts: [query],
    });
    return result;
  }

  async countAndPeekServicePublicDocuments() {
    const collection = await this.client.getOrCreateCollection({
      name: this.SERVICE_PUBLIC_COLLECTION,
      embeddingFunction: this.embedder,
    });
    const numDocs = await collection.count();
    const peek = await collection.peek();
    return { numDocs, peek };
  }

  async listAllDocumentsMetadata() {
    const collection = await this.client.getOrCreateCollection({
      name: this.SERVICE_PUBLIC_COLLECTION,
      embeddingFunction: this.embedder,
    });
    const documents = await collection.get();
    return documents.metadatas;
  }
}
