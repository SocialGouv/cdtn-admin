import { AbortController } from "@azure/abort-controller";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const AZURE_STORAGE_ACCOUNT = {
  key: process.env.AZURE_STORAGE_ACCOUNT_KEY || "",
  name: process.env.AZURE_STORAGE_ACCOUNT_NAME || "",
};

export const getBlobContainer = (containerName) => {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    AZURE_STORAGE_ACCOUNT.name,
    AZURE_STORAGE_ACCOUNT.key
  );

  const service = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT.name}.blob.core.windows.net`,
    sharedKeyCredential
  );

  return service.getContainerClient(containerName);
};

export const getContainerBlobs = async (containerName) => {
  const container = getBlobContainer(containerName);
  const blobs = [];
  for await (const blob of container.listBlobsFlat()) {
    blobs.push({
      contentLength: blob.properties.contentLength,
      lastModified: blob.properties.lastModified,
      name: blob.name,
      url: `https://${AZURE_STORAGE_ACCOUNT.name}.blob.core.windows.net/${containerName}/${blob.name}`,
    });
  }
  return blobs;
};

export const deleteBlob = async (containerName, blobName) => {
  const container = getBlobContainer(containerName);
  const client = container.getBlockBlobClient(blobName);
  return client.delete();
};

export const uploadBlob = async (containerName, stream) => {
  const container = getBlobContainer(containerName);
  const client = container.getBlockBlobClient(stream.name);
  const blockSize = 4 * 1024 * 1024;
  const timeout = 30 * 60 * 1000;
  const concurrency = 20;
  const options = { abortSignal: AbortController.timeout(timeout) };
  try {
    return client.uploadStream(stream, blockSize, concurrency, options);
  } catch (err) {
    console.log("Error", err);
  }
};
