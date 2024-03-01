import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import axios from "axios";
import { inject, injectable } from "inversify";

import { name } from "../utils";

export const S3Parameters = {
  BUCKET_ACCESS_KEY: Symbol("BUCKET_ACCESS_KEY"),
  BUCKET_ENDPOINT: Symbol("BUCKET_ENDPOINT"),
  BUCKET_NAME: Symbol("BUCKET_NAME"),
  BUCKET_REGION: Symbol("BUCKET_REGION"),
  BUCKET_SECRET_KEY: Symbol("BUCKET_SECRET_KEY"),
  BUCKET_DRAFT_FOLDER: Symbol("BUCKET_DRAFT_FOLDER"),
  BUCKET_PUBLISHED_FOLDER: Symbol("BUCKET_PUBLISHED_FOLDER"),
};

@injectable()
@name("S3Repository")
export class S3Repository {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly draftFolder: string;
  private readonly publishedFolder: string;

  constructor(
    @inject(S3Parameters.BUCKET_ACCESS_KEY) accessKey: string,
    @inject(S3Parameters.BUCKET_ENDPOINT) endpoint: string,
    @inject(S3Parameters.BUCKET_NAME) bucketName: string,
    @inject(S3Parameters.BUCKET_REGION) region: string,
    @inject(S3Parameters.BUCKET_SECRET_KEY) secretKey: string,
    @inject(S3Parameters.BUCKET_DRAFT_FOLDER) draftFolder: string,
    @inject(S3Parameters.BUCKET_PUBLISHED_FOLDER) publishedFolder: string
  ) {
    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
    this.bucketName = bucketName;
    this.draftFolder = draftFolder;
    this.publishedFolder = publishedFolder;
  }

  async getFileFromDraft(key: string, folder: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: `${this.draftFolder}/${folder}/${key}`,
    });
    const response = await this.s3Client.send(command);
    if (response.Body === undefined) {
      throw new Error("Response body is undefined");
    }
    const str = await response.Body.transformToString();
    return str;
  }

  async uploadSitemap(
    sitemapEndpoint: string,
    folder: string,
    key: string
  ): Promise<void> {
    const response = await axios.get(sitemapEndpoint);
    const data: string = response.data;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${this.draftFolder}/${folder}/${key}`,
      Body: data,
      ContentType: "text/xml",
      ACL: "public-read",
    });
    await this.s3Client.send(command);
  }

  async uploadAgreements(
    data: string,
    folder: string,
    key: string
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${this.draftFolder}/${folder}/${key}`,
      Body: data,
      ContentType: "application/json",
      ACL: "public-read",
    });
    await this.s3Client.send(command);
  }

  async copyFolderFromDraftToPublished(): Promise<void> {
    //TODO: à tester la suppression, car je suis pas sûr que ça gère ce usecase
    const command = new CopyObjectCommand({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${this.draftFolder}`,
      Key: this.publishedFolder,
      ACL: "public-read",
      MetadataDirective: "REPLACE",
    });
    await this.s3Client.send(command);
  }
}
