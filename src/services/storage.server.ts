import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const storageConfig = {
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION,
  credentials: {
    accessKeyId: process.env.STORAGE_KEY || "",
    secretAccessKey: process.env.STORAGE_SECRET || "",
  },
};

export const upload = async (key, content) => {
  const client = new S3Client(storageConfig);

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: key,
      Body: content,
    })
  );
};

export const download = async (key) => {
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

  return await new Promise((resolve, reject, data = "") => {
    response.Body.on("data", (chunk) => (data += chunk));
    response.Body.on("end", () => resolve(data));
  });
};

export const list = async (key) => {
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
  upload,
  download,
  list,
};
