import { inject, injectable } from "inversify";

import { chunk, chunkText, getName, name } from "../utils";
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
      CollectionSlug.SERVICE_PUBLIC,
      (doc) => doc.text
    );
  }

  async ingestContributionDocuments() {
    return await this.ingestDocuments(
      SOURCES.CONTRIBUTIONS,
      CollectionSlug.CONTRIBUTION,
      (r) => {
        const idccNumber = r.slug.split("-")[0];
        const answer =
          r.document.answers?.generic?.markdown +
          "\n\n" +
          r.document.answers?.conventionAnswer?.markdown;
        return "Pour l'idcc numéro " + idccNumber + "\n\n" + answer + "\n\n";
      }
    );
  }

  async ingestDocuments(
    source: string,
    collectionName: string,
    getText: (doc: any) => string
  ) {
    const results = await this.documentsRepository.getBySource(source);
    const collection = await this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embedder,
    });
    const resultsSplits = chunk(results, 50);
    for (let j = 0; j < resultsSplits.length; j++) {
      const batch = resultsSplits[j];
      const { ids, metadatas, documents } = batch.reduce(
        (acc, r) => {
          const id = r.cdtnId;
          const text = getText(r);
          if (text.length > 5000) {
            const textSplits = chunkText(text, 5000);
            const idSplits = textSplits.map((_, i) => `${id}-${i}`);
            const metadatasSplits = textSplits.map((_, i) => ({
              title: r.title,
              metaDescription: r.metaDescription,
            }));
            acc.ids.push(...idSplits);
            acc.documents.push(...textSplits);
            acc.metadatas.push(...metadatasSplits);
            return acc;
          }
          acc.ids.push(id);
          acc.documents.push(text);
          acc.metadatas.push({
            title: r.title,
            metaDescription: r.metaDescription,
          });
          return acc;
        },
        { ids: [], metadatas: [], documents: [] } as any
      );

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

  async cleanServicePublicDocuments() {
    return await this.cleanDocuments(CollectionSlug.SERVICE_PUBLIC);
  }

  async cleanContributionDocuments() {
    return await this.cleanDocuments(CollectionSlug.CONTRIBUTION);
  }

  private async cleanDocuments(collectionName: string) {
    const collection = await this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embedder,
    });
    await collection.delete();
    return { result: "Documents deleted" };
  }

  async getHasuraDocumentBySource(source: string, length = 20) {
    const result = await this.documentsRepository.getBySource(source);
    return result.slice(0, length) as any;
  }
}
