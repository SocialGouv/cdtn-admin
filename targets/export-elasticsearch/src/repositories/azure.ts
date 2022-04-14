import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import axios from "axios";
import { inject, injectable } from "inversify";
import { Readable } from "stream";

import { name, streamToBuffer } from "../utils";

export const AzureParameters = {
  ACCOUNT_KEY: Symbol("ACCOUNT_KEY"),
  ACCOUNT_NAME: Symbol("ACCOUNT_NAME"),
  BUCKET_URL: Symbol("BUCKET_URL"),
};
@injectable()
@name("AzureRepository")
export class AzureRepository {
  private readonly blobServiceClient: BlobServiceClient;

  constructor(
    @inject(AzureParameters.ACCOUNT_NAME) accountName: string,
    @inject(AzureParameters.ACCOUNT_KEY) accountKey: string,
    @inject(AzureParameters.BUCKET_URL) bucketUrl: string
  ) {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );
    this.blobServiceClient = new BlobServiceClient(
      bucketUrl,
      sharedKeyCredential
    );
  }

  async getFile(
    destinationContainer: string,
    destinationName: string
  ): Promise<string> {
    const containerClient =
      this.blobServiceClient.getContainerClient(destinationContainer);
    const blobClient = containerClient.getBlobClient(destinationName);
    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = (
      await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
    ).toString();
    return downloaded;
  }

  async uploadFile(
    sitemapEndpoint: string,
    destinationContainer: string,
    destinationName: string
  ): Promise<void> {
    const containerClient =
      this.blobServiceClient.getContainerClient(destinationContainer);
    await containerClient.createIfNotExists();
    const response = await axios.get(sitemapEndpoint);
    const data: string = response.data;
    const buffer = Buffer.from(data, "utf8");
    const content = Readable.from(buffer);
    const blockBlobClient = containerClient.getBlockBlobClient(destinationName);
    await blockBlobClient.uploadStream(content);
  }

  async copyBucket(
    sourceContainerName: string,
    destinationContainerName: string
  ): Promise<void> {
    const sourceContainer =
      this.blobServiceClient.getContainerClient(sourceContainerName);
    const destinationContainer = this.blobServiceClient.getContainerClient(
      destinationContainerName
    );
    await destinationContainer.createIfNotExists();
    const listBlobsResponse = sourceContainer.listBlobsFlat();
    for await (const blob of listBlobsResponse) {
      const sourceBlob = sourceContainer.getBlobClient(blob.name);
      const destinationBlob = destinationContainer.getBlobClient(
        sourceBlob.name
      );
      await destinationBlob.beginCopyFromURL(sourceBlob.url);
    }
  }

  async setSamePolicy(
    sourceContainerName: string,
    destinationContainerName: string
  ): Promise<void> {
    const sourceContainer =
      this.blobServiceClient.getContainerClient(sourceContainerName);
    const destinationContainer = this.blobServiceClient.getContainerClient(
      destinationContainerName
    );
    const policy = await sourceContainer.getAccessPolicy();
    await destinationContainer.setAccessPolicy(policy.blobPublicAccess);
  }
}
