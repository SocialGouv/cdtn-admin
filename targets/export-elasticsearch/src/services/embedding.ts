import { inject, injectable } from "inversify";

import { chunk, getName, name } from "../utils";
import { DocumentsRepository } from "../repositories";
import { SOURCES } from "@socialgouv/cdtn-utils";
import {
  ChromaClient,
  IEmbeddingFunction,
  OpenAIEmbeddingFunction,
} from "chromadb";
import { CollectionSlug } from "../type";

@injectable()
@name("EmbeddingService")
export class EmbeddingService {
  client: ChromaClient;
  embedder: IEmbeddingFunction;

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
      CollectionSlug.SERVICE_PUBLIC
    );
  }

  async ingestContributionDocuments() {
    return await this.ingestDocuments(
      SOURCES.CONTRIBUTIONS,
      CollectionSlug.CONTRIBUTION
    );
  }

  private async ingestDocuments(
    source: string,
    collectionName: CollectionSlug
  ) {
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
    return await this.getDocuments(CollectionSlug.CONTRIBUTION, query);
  }

  async getServicePublicDocuments(query: string) {
    return await this.getDocuments(CollectionSlug.SERVICE_PUBLIC, query);
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
    return await this.countAndPeekDocuments(CollectionSlug.CONTRIBUTION);
  }

  async countAndPeekServicePublicDocuments() {
    return await this.countAndPeekDocuments(CollectionSlug.SERVICE_PUBLIC);
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
    return await this.listDocumentsMetadata(CollectionSlug.SERVICE_PUBLIC);
  }

  async listContributionDocumentsMetadata() {
    return await this.listDocumentsMetadata(CollectionSlug.CONTRIBUTION);
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
