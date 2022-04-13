import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import axios from "axios";
import { injectable } from "inversify";
import { Readable } from "stream";

import { name, streamToBuffer } from "../utils";

@injectable()
@name("SitemapService")
export class SitemapService {
  private readonly blobServiceClient: BlobServiceClient;

  constructor(
    accountName = process.env.AZ_ACCOUNT_NAME ?? "",
    accountKey = process.env.AZ_ACCOUNT_KEY ?? "",
    bucketUrl = `https://${accountName}.blob.core.windows.net`
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

  async getSitemap(
    destinationContainer = process.env.DESTINATION_CONTAINER ?? "sitemap",
    destinationName = process.env.DESTINATION_NAME ?? "sitemap-xml"
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
    sitemapEndpoint = process.env.SITEMAP_ENDPOINT ?? "http://www/sitemap.xml",
    destinationContainer = process.env.DESTINATION_CONTAINER ?? "sitemap",
    destinationName = process.env.DESTINATION_NAME ?? "sitemap-xml"
  ): Promise<void> {
    const containerClient =
      this.blobServiceClient.getContainerClient(destinationContainer);
    try {
      await containerClient.create();
    } catch {
      // do nothing
    }
    const response = await axios.get(sitemapEndpoint);
    const data: string = response.data;
    const buffer = Buffer.from(data, "utf8");
    const content = Readable.from(buffer);
    const blockBlobClient = containerClient.getBlockBlobClient(destinationName);
    await blockBlobClient.uploadStream(content);
  }
}
