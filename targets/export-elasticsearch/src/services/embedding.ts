import { inject, injectable } from "inversify";

import { chunk, chunkText, getName, name } from "../utils";
import { DocumentsRepository } from "../repositories";
import { SOURCES } from "@socialgouv/cdtn-utils";
import {
  ChromaClient,
  IEmbeddingFunction,
  OpenAIEmbeddingFunction,
} from "chromadb";
import { CollectionSlug, DocumentRepo } from "../type";

interface ChromaGetResult {
  text: string;
  metadatas: Record<string, any>;
}

type ChromaGetResults = ChromaGetResult[];

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
    await this.ingestDocuments(
      SOURCES.SHEET_SP,
      CollectionSlug.SERVICE_PUBLIC,
      (doc) => doc.text
    );
    return { result: "Documents ingested" };
  }

  async ingestContributionDocuments() {
    await this.ingestDocuments(
      SOURCES.CONTRIBUTIONS,
      CollectionSlug.CONTRIBUTION_GENERIC,
      (r) => {
        return (
          r.document.answers?.generic?.text ??
          r.document.answers?.generic?.markdown ??
          ""
        );
      }
    );
    await this.ingestDocuments(
      SOURCES.CONTRIBUTIONS,
      CollectionSlug.CONTRIBUTION_IDCC,
      (r) => {
        return r.document.answers?.conventionAnswer?.markdown ?? "";
      },
      (r) => {
        return {
          idccNumber: r.slug.split("-")[0],
        };
      }
    );
    return { result: "Documents ingested" };
  }

  async ingestDocuments(
    source: string,
    collectionName: string,
    getText: (doc: DocumentRepo) => string,
    getMetadata?: (doc: DocumentRepo) => Record<string, any>
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
          if (text.length < 100) {
            return acc;
          }
          if (text.length > 10000) {
            const textSplits = chunkText(text, 5000);
            const idSplits = textSplits.map((_, i) => `${id}-${i}`);
            const metadatasSplits = textSplits.map(() => ({
              title: r.title,
              metaDescription: r.metaDescription,
              id,
              numChunks: idSplits.length,
              ...getMetadata?.(r),
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
            id,
            ...getMetadata?.(r),
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
  }

  async getContributionGenericDocuments(query: string, nResults: number) {
    return await this.getDocuments(
      CollectionSlug.CONTRIBUTION_GENERIC,
      query,
      nResults
    );
  }

  async getContributionIdccDocuments(
    query: string,
    nResults: number,
    idccNumber: string
  ) {
    return await this.getDocuments(
      CollectionSlug.CONTRIBUTION_IDCC,
      query,
      nResults,
      {
        where: {
          idccNumber: {
            $eq: idccNumber,
          },
        },
      }
    );
  }

  async getServicePublicDocuments(
    query: string,
    nResults: number
  ): Promise<ChromaGetResults> {
    return await this.getDocuments(
      CollectionSlug.SERVICE_PUBLIC,
      query,
      nResults
    );
  }

  private async getDocuments(
    collectionName: string,
    query: string,
    nResults: number,
    optionalQueryParam?: Record<string, any>
  ): Promise<ChromaGetResults> {
    try {
      const result: ChromaGetResults = [];
      const collection = await this.client.getOrCreateCollection({
        name: collectionName,
        embeddingFunction: this.embedder,
      });
      const queryTextsResult = await collection.query({
        queryTexts: [query],
        nResults,
        ...optionalQueryParam,
      });
      const metadataList = queryTextsResult.metadatas[0]!.reduce(
        (acc: any[], m: any) => {
          if (!acc.find((a) => a.metaDescription === m.metaDescription)) {
            acc.push(m);
          }
          return acc;
        },
        []
      );
      for (let i = 0; i < metadataList.length; i++) {
        const metadata = metadataList[i]!;
        const queryResult = await collection.get({
          where: {
            id: {
              $eq: metadata.id as string,
            },
          },
        });
        if (queryResult) {
          const ids = queryResult.ids;
          const documents = queryResult.documents;
          const text: string = documents
            .map((_doc, j) => ({
              [`${ids[j]}`]: documents[j],
            }))
            .sort((a, b) => {
              const aKey = Object.keys(a)[0];
              const bKey = Object.keys(b)[0];
              return aKey.localeCompare(bKey);
            })
            .reduce((acc, curr) => {
              const text = Object.values(curr);
              return acc + text;
            }, "");
          result.push({
            text,
            metadatas: metadata,
          });
        }
      }
      return result;
    } catch (e: any) {
      // console.error(e);
      return [];
    }
  }

  async countAndPeekDocuments(collectionName: CollectionSlug) {
    const collection = await this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embedder,
    });
    const numDocs = await collection.count();
    const peek = await collection.peek();
    return { numDocs, peek };
  }

  async listDocumentsMetadata(collectionName: CollectionSlug) {
    const collection = await this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embedder,
    });
    const documents = await collection.get();
    return documents.metadatas;
  }

  async cleanDocuments(collectionName: CollectionSlug) {
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
