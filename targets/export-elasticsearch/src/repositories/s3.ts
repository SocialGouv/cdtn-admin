import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  ListObjectsCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import axios from "axios";
import { inject, injectable } from "inversify";

import { diff, name } from "../utils";
import { Environment } from "@shared/types";
import { logger } from "@shared/utils";
const mime = require("mime-types");

export const S3Parameters = {
  BUCKET_ACCESS_KEY: Symbol("BUCKET_ACCESS_KEY"),
  BUCKET_ENDPOINT: Symbol("BUCKET_ENDPOINT"),
  BUCKET_NAME: Symbol("BUCKET_NAME"),
  BUCKET_REGION: Symbol("BUCKET_REGION"),
  BUCKET_SECRET_KEY: Symbol("BUCKET_SECRET_KEY"),
  BUCKET_DRAFT_FOLDER: Symbol("BUCKET_DRAFT_FOLDER"),
  BUCKET_PUBLISHED_FOLDER: Symbol("BUCKET_PUBLISHED_FOLDER"),
  BUCKET_PREVIEW_FOLDER: Symbol("BUCKET_PREVIEW_FOLDER"),
  BUCKET_DEFAULT_FOLDER: Symbol("BUCKET_DEFAULT_FOLDER"),
};

@injectable()
@name("S3Repository")
export class S3Repository {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly draftFolder: string;
  private readonly publishedFolder: string;
  private readonly previewFolder: string;
  private readonly defaultFolder: string;

  constructor(
    @inject(S3Parameters.BUCKET_ACCESS_KEY) accessKey: string,
    @inject(S3Parameters.BUCKET_ENDPOINT) endpoint: string,
    @inject(S3Parameters.BUCKET_NAME) bucketName: string,
    @inject(S3Parameters.BUCKET_REGION) region: string,
    @inject(S3Parameters.BUCKET_SECRET_KEY) secretKey: string,
    @inject(S3Parameters.BUCKET_DRAFT_FOLDER) draftFolder: string,
    @inject(S3Parameters.BUCKET_PUBLISHED_FOLDER) publishedFolder: string,
    @inject(S3Parameters.BUCKET_PREVIEW_FOLDER) previewFolder: string,
    @inject(S3Parameters.BUCKET_DEFAULT_FOLDER) bucketDefaultFolder: string
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
    this.previewFolder = previewFolder;
    this.defaultFolder = bucketDefaultFolder;
  }

  async uploadSitemap(
    environment: Environment,
    sitemapEndpoint: string,
    folder: string,
    key: string
  ): Promise<void> {
    const keyFolder =
      environment === "production"
        ? `${this.publishedFolder}/${folder}/${key}`
        : `${this.previewFolder}/${folder}/${key}`;
    const response = await axios.get(sitemapEndpoint);
    if (response.status !== 200 || !response.data)
      throw new Error(`Error while fetching sitemap: ${response.status}`);
    const data: string = response.data;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: keyFolder,
      Body: data,
      ContentType: "text/xml",
      ACL: "public-read",
    });
    await this.s3Client.send(command);
  }

  async uploadAgreements(
    environment: Environment,
    data: string,
    folder: string,
    key: string
  ): Promise<void> {
    const keyFolder =
      environment === "production"
        ? `${this.publishedFolder}/${folder}/${key}`
        : `${this.previewFolder}/${folder}/${key}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: keyFolder,
      Body: data,
      ContentType: "application/json",
      ACL: "public-read",
    });
    await this.s3Client.send(command);
  }

  async copyFolder(environment: Environment): Promise<void> {
    try {
      const sourceFolder =
        environment === "production"
          ? `${this.previewFolder}/${this.defaultFolder}`
          : `${this.draftFolder}/${this.defaultFolder}`;
      const destinationFolder =
        environment === "production"
          ? `${this.publishedFolder}/${this.defaultFolder}`
          : `${this.previewFolder}/${this.defaultFolder}`;

      // 1. Récupérer les anciennes clés dans le published
      const listCommandDestinationFolder = new ListObjectsCommand({
        Bucket: this.bucketName,
        Prefix: destinationFolder,
      });
      const listContentsDestinationFolder = await this.s3Client.send(
        listCommandDestinationFolder
      );
      const listKeysDestinationFolder =
        listContentsDestinationFolder.Contents?.map((file) => {
          if (!file.Key) {
            throw new Error("File key is not defined");
          }
          return file.Key;
        }) ?? [];

      // 2. Récupérer les nouvelles clés dans la preview
      const listCommandSourceFolder = new ListObjectsCommand({
        Bucket: this.bucketName,
        Prefix: sourceFolder,
      });
      const listContentsSourceFolder = await this.s3Client.send(
        listCommandSourceFolder
      );
      const listKeysSourceFolder =
        listContentsSourceFolder.Contents?.map((file) => {
          if (!file.Key) {
            throw new Error("File key is not defined");
          }
          return file.Key;
        }) ?? [];

      // 3. Copier les clés de la preview vers le published
      for (const key of listKeysSourceFolder) {
        const nameFile = key.split("/").pop();
        const mimeType = mime.lookup(key);
        const copyCommand = new CopyObjectCommand({
          Bucket: this.bucketName,
          CopySource: encodeURI(`${this.bucketName}/${key}`),
          Key: `${destinationFolder}/${nameFile}`,
          ACL: "public-read",
          MetadataDirective: "REPLACE",
          ContentType: mimeType,
        });

        await this.s3Client.send(copyCommand);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // 4. Supprimer les clés productions non présente dans le review (clean)
      const listKeysToDelete = diff(
        listKeysDestinationFolder.map((v) => v.split("/").pop()!),
        listKeysSourceFolder.map((v) => v.split("/").pop()!)
      ).map((key) => {
        return {
          Key: `${destinationFolder}/${key}`,
        };
      });
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: listKeysToDelete,
        },
      });
      await this.s3Client.send(deleteCommand);
    } catch (error) {
      logger.error(`Error while copying folder: ${error}`);
      throw error;
    }
  }
}
