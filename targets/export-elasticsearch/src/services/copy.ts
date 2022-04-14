import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import axios from "axios";
import { injectable } from "inversify";
import { Readable } from "stream";

import { name, streamToBuffer } from "../utils";

@injectable()
@name("CopyService")
export class CopyService {
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

    // const job = restoreContainerJob({
    //   env: [
    //     new EnvVar({
    //       name: "SOURCE_CONTAINER",
    //       value: "cdtn",
    //     }),
    //     new EnvVar({
    //       name: "DESTINATION_CONTAINER",
    //       value: params.container,
    //     }),
    //   ],
    //   from: "dev",
    //   project: "cdtn-admin",
    //   to: params.server,
    // });
  }

  async getCopy(
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

  async uploadCopy(
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
