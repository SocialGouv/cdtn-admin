import { inject, injectable } from "inversify";

import { chunk, getName, name } from "../utils";
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
  private CONTRIBUTION_COLLECTION = "contribution";

  constructor(
    @inject(getName(DocumentsRepository))
    private readonly documentsRepository: DocumentsRepository
  ) {
    this.client = new ChromaClient();
    this.embedder = new OpenAIEmbeddingFunction({
      openai_api_key: process.env.OPENAI_API_KEY!,
    });
  }

  async ingestServicePublicDocuments() {
    return await this.ingestDocuments(
      SOURCES.SHEET_SP,
      this.SERVICE_PUBLIC_COLLECTION
    );
  }

  async ingestContributionDocuments() {
    return await this.ingestDocuments(
      SOURCES.CONTRIBUTIONS,
      this.CONTRIBUTION_COLLECTION
    );
  }

  private async ingestDocuments(source: string, collectionName: string) {
    const results = await this.documentsRepository.getBySource(source);
    const collection = await this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embedder,
    });
    const resultsSplits = chunk(results, 25);
    for (let j = 0; j < resultsSplits.length; j++) {
      const batch = resultsSplits[j];
      const ids = batch.map((r) => r.cdtnId);
      const documents = batch.map((r) => r.text);
      const metadatas = batch.map((r) => ({
        title: r.title,
        metaDescription: r.metaDescription,
      }));
      try {
        await collection.upsert({
          ids,
          metadatas,
          documents,
        });
      } catch (e) {
        console.error(e);
      }
    }

    return { result: "Documents ingested" };
  }

  async getContributionDocuments(query: string) {
    return await this.getDocuments(this.CONTRIBUTION_COLLECTION, query);
  }

  async getServicePublicDocuments(query: string) {
    return await this.getDocuments(this.SERVICE_PUBLIC_COLLECTION, query);
  }

  async getDocuments(collectionName: string, query: string) {
    const collection = await this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embedder,
    });
    const result = await collection.query({
      queryTexts: [query],
    });
    return result;
  }

  async countAndPeekContributionDocuments() {
    return await this.countAndPeekDocuments(this.CONTRIBUTION_COLLECTION);
  }

  async countAndPeekServicePublicDocuments() {
    return await this.countAndPeekDocuments(this.SERVICE_PUBLIC_COLLECTION);
  }

  private async countAndPeekDocuments(collectionName: string) {
    const collection = await this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embedder,
    });
    const numDocs = await collection.count();
    const peek = await collection.peek();
    return { numDocs, peek };
  }

  async listServicePublicDocumentsMetadata() {
    return await this.listDocumentsMetadata(this.SERVICE_PUBLIC_COLLECTION);
  }

  async listContributionDocumentsMetadata() {
    return await this.listDocumentsMetadata(this.CONTRIBUTION_COLLECTION);
  }

  private async listDocumentsMetadata(collectionName: string) {
    const collection = await this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embedder,
    });
    const documents = await collection.get();
    return documents.metadatas;
  }
}
