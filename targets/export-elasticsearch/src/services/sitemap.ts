import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import axios from "axios";
import { injectable } from "inversify";

import { name, streamToBuffer } from "../utils";

@injectable()
@name("SitemapService")
export class SitemapService {
  private readonly blobServiceClient: BlobServiceClient;

  constructor(
    accountName = process.env.AZ_ACCOUNT_NAME ?? "",
    accountKey = process.env.AZ_ACCOUNT_KEY ?? ""
  ) {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );
    this.blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );
  }

  async getSitemap(
    destinationName: string,
    destinationContainer: string
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

  async uploadSitemap(
    sitemapEndpoint: string,
    destinationContainer: string,
    destinationName: string
  ): Promise<void> {
    const containerClient =
      this.blobServiceClient.getContainerClient(destinationContainer);
    const response = await axios.get(sitemapEndpoint);
    const content: string = response.data;
    const blockBlobClient = containerClient.getBlockBlobClient(destinationName);
    await blockBlobClient.upload(content, content.length);
  }
}
