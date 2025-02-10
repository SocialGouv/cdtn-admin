import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  _Object,
} from "@aws-sdk/client-s3";
const mime = require("mime-types");

const region = process.env.BUCKET_REGION ?? "us-east-1";
const endpoint = process.env.BUCKET_ENDPOINT ?? "http://localhost:9000";
const publicEndpoint =
  process.env.NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT ?? "http://localhost:9000";
const accessKeyId = process.env.BUCKET_ACCESS_KEY ?? "MINIO_ACCESS_KEY";
const secretAccessKey = process.env.BUCKET_SECRET_KEY ?? "MINIO_SECRET_KEY";
const bucketName = process.env.BUCKET_NAME ?? "cdtn";
const bucketDraftFolder =
  process.env.NEXT_PUBLIC_BUCKET_DRAFT_FOLDER ?? "draft";
const bucketDefaultFolder =
  process.env.NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER ?? "default";

const client = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

export type S3File = {
  key: string;
  lastModified: Date;
  size: number;
  url: string;
};

export const getApiAllFiles = async (): Promise<S3File[]> => {
  const prefix = `${bucketDraftFolder}/${bucketDefaultFolder}/`;
  const command = new ListObjectsCommand({
    Bucket: bucketName,
    Prefix: prefix,
  });
  const files = await client.send(command);
  const contents = files.Contents ?? [];
  return contents.map((file: _Object) => {
    if (!file.Key || !file.LastModified || !file.Size) {
      throw new Error("Error while parsing the file");
    }
    return {
      key: file.Key.replace(prefix, ""),
      lastModified: file.LastModified,
      size: file.Size,
      url: `${publicEndpoint}/${file.Key}`,
    };
  });
};

export const deleteApiFile = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: `${bucketDraftFolder}/${bucketDefaultFolder}/${key}`,
  });
  return await client.send(command);
};

export const uploadApiFiles = async (key: string, data: Buffer) => {
  try {
    const mimeType = mime.lookup(key);
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${bucketDraftFolder}/${bucketDefaultFolder}/${key}`,
      ACL: "public-read",
      Body: data,
      ContentType: mimeType,
    });
    return await client.send(command);
  } catch (err) {
    console.error(err);
    throw new Error("Error while uploading the file to the bucket");
  }
};
