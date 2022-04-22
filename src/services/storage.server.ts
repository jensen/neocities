import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import type { Stream } from "stream";

const storageConfig = {
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION,
  credentials: {
    accessKeyId: process.env.STORAGE_KEY || "",
    secretAccessKey: process.env.STORAGE_SECRET || "",
  },
};

const convertStreamToString = (stream: Stream): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

export const stream = async (key: string, stream) => {
  const client = new S3Client(storageConfig);

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: key,
      Body: stream,
    })
  );
};

export const upload = async (key: string, content: string) => {
  const client = new S3Client(storageConfig);

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: key,
      Body: content,
    })
  );
};

export const download = async (key: string): Promise<string> => {
  const client = new S3Client(storageConfig);

  const response = await client.send(
    new GetObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: key,
    })
  );

  if (!response) {
    throw new Error("Could not download file.");
  }

  if (!response.Body) {
    throw new Error("Response has no body");
  }

  return await convertStreamToString(response.Body as Stream);
};

export const list = async (key: string) => {
  const client = new S3Client(storageConfig);

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: process.env.STORAGE_BUCKET,
      Prefix: key,
    })
  );

  return response.Contents?.map((file) => file.Key?.substring(key.length + 1));
};

export default {
  stream,
  upload,
  download,
  list,
};
