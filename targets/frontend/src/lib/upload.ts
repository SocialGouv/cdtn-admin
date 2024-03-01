import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
} from "@aws-sdk/client-s3";

const region = process.env.BUCKET_REGION;
const endpoint = process.env.BUCKET_ENDPOINT ?? "http://localhost:9000";
const accessKeyId = process.env.BUCKET_ACCESS_KEY ?? "MINIO_ACCESS_KEY";
const secretAccessKey = process.env.BUCKET_SECRET_KEY ?? "MINIO_SECRET_KEY";
const bucketName = process.env.BUCKET_NAME ?? "cdtn";
const bucketDraftFolder = process.env.BUCKET_DRAFT_FOLDER ?? "draft";
const bucketDefaultFolder = process.env.BUCKET_DEFAULT_FOLDER ?? "default";

const client = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const getApiAllFiles = async () => {
  const command = new ListObjectsCommand({
    Bucket: bucketName,
    Prefix: `${bucketDraftFolder}/${bucketDefaultFolder}/`,
  });
  const files = await client.send(command);
  return files.Contents;
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
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${bucketDraftFolder}/${bucketDefaultFolder}/${key}`,
      ACL: "public-read",
      Body: data,
    });
    return await client.send(command);
  } catch (err) {
    console.log("Error", err);
    throw new Error("Error while uploading the file to the bucket");
  }
};
