import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import axios from "axios";
import { inject, injectable } from "inversify";
import { Readable } from "stream";

import { name, streamToBuffer } from "../utils";

export const AzureParameters = {
  ACCOUNT_KEY_FROM: Symbol("ACCOUNT_KEY_FROM"),
  ACCOUNT_KEY_TO: Symbol("ACCOUNT_KEY_TO"),
  ACCOUNT_NAME_FROM: Symbol("ACCOUNT_NAME_FROM"),
  ACCOUNT_NAME_TO: Symbol("ACCOUNT_NAME_TO"),
  BUCKET_URL_FROM: Symbol("BUCKET_URL_FROM"),
  BUCKET_URL_TO: Symbol("BUCKET_URL_TO"),
};

@injectable()
@name("AzureRepository")
export class AzureRepository {
  private readonly blobServiceClientFrom: BlobServiceClient;

  private readonly blobServiceClientTo: BlobServiceClient;

  constructor(
    @inject(AzureParameters.ACCOUNT_NAME_FROM) accountNameFrom: string,
    @inject(AzureParameters.ACCOUNT_KEY_FROM) accountKeyFrom: string,
    @inject(AzureParameters.BUCKET_URL_FROM) bucketUrlFrom: string,
    @inject(AzureParameters.ACCOUNT_NAME_TO) accountNameTo: string,
    @inject(AzureParameters.ACCOUNT_KEY_TO) accountKeyTo: string,
    @inject(AzureParameters.BUCKET_URL_TO) bucketUrlTo: string
  ) {
    const sharedKeyCredentialFrom = new StorageSharedKeyCredential(
      accountNameFrom,
      accountKeyFrom
    );
    this.blobServiceClientFrom = new BlobServiceClient(
      bucketUrlFrom,
      sharedKeyCredentialFrom
    );
    const sharedKeyCredentialTo = new StorageSharedKeyCredential(
      accountNameTo,
      accountKeyTo
    );
    this.blobServiceClientTo = new BlobServiceClient(
      bucketUrlTo,
      sharedKeyCredentialTo
    );
  }

  async getFile(
    destinationContainer: string,
    destinationName: string
  ): Promise<string> {
    const containerClient =
      this.blobServiceClientFrom.getContainerClient(destinationContainer);
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
      this.blobServiceClientFrom.getContainerClient(destinationContainer);
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
      this.blobServiceClientFrom.getContainerClient(sourceContainerName);
    const destinationContainer = this.blobServiceClientTo.getContainerClient(
      destinationContainerName
    );
    await destinationContainer.createIfNotExists();
    for await (const blob of sourceContainer.listBlobsFlat()) {
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
      this.blobServiceClientFrom.getContainerClient(sourceContainerName);
    const destinationContainer = this.blobServiceClientTo.getContainerClient(
      destinationContainerName
    );
    const policy = await sourceContainer.getAccessPolicy();
    await destinationContainer.setAccessPolicy(policy.blobPublicAccess);
  }
}
