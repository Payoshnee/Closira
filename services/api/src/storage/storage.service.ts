import { Injectable } from "@nestjs/common";
import { StorageProvider } from "@prisma/client";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { unlink } from "node:fs/promises";
import { join, normalize } from "node:path";

export type SignedUploadInput = {
  key: string;
  contentType: string;
  byteSize: number;
};

export type SignedUpload = {
  provider: StorageProvider;
  storageKey: string;
  uploadUrl: string;
  publicUrl: string;
  expiresInSeconds: number;
  headers?: Record<string, string>;
};

export type SignedRead = {
  url: string;
  expiresInSeconds: number;
};

@Injectable()
export class StorageService {
  async createSignedUpload(input: SignedUploadInput): Promise<SignedUpload> {
    const provider = storageProvider();
    if (provider === "LOCAL") {
      return {
        provider,
        storageKey: input.key,
        uploadUrl: `/api/v1/uploads/local/${encodeURIComponent(input.key)}`,
        publicUrl: "",
        expiresInSeconds: 900
      };
    }

    const bucket = requiredEnv("STORAGE_BUCKET");
    const client = createS3Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      ContentType: input.contentType,
      ContentLength: input.byteSize
    });
    const expiresInSeconds = Number(process.env.STORAGE_SIGNED_URL_TTL_SECONDS ?? 900);

    return {
      provider,
      storageKey: input.key,
      uploadUrl: await getSignedUrl(client, command, { expiresIn: expiresInSeconds }),
      publicUrl: publicUrl(input.key, bucket),
      expiresInSeconds,
      headers: { "Content-Type": input.contentType }
    };
  }

  async deleteObject(key: string, provider = storageProvider()) {
    if (provider === "LOCAL") {
      const target = this.localPath(key);
      await unlink(target).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });
      return;
    }

    const bucket = requiredEnv("STORAGE_BUCKET");
    const client = createS3Client();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  async readObjectBuffer(key: string, provider = storageProvider()) {
    if (provider === "LOCAL") {
      const { readFile } = await import("node:fs/promises");
      return readFile(this.localPath(key));
    }

    const bucket = requiredEnv("STORAGE_BUCKET");
    const response = await createS3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!response.Body) {
      throw new Error("Storage object body is empty.");
    }

    return Buffer.from(await response.Body.transformToByteArray());
  }

  async writeObject(key: string, body: Buffer, contentType: string, provider = storageProvider()) {
    if (provider === "LOCAL") {
      const { mkdir, writeFile } = await import("node:fs/promises");
      const { dirname } = await import("node:path");
      const target = this.localPath(key);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, body);
      return;
    }

    const bucket = requiredEnv("STORAGE_BUCKET");
    await createS3Client().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
  }

  async createSignedRead(key: string, provider = storageProvider()): Promise<SignedRead> {
    const expiresInSeconds = Number(process.env.STORAGE_READ_URL_TTL_SECONDS ?? 300);
    if (provider === "LOCAL") {
      return {
        url: `/api/v1/uploads/local/${encodeURIComponent(key)}`,
        expiresInSeconds
      };
    }

    const bucket = requiredEnv("STORAGE_BUCKET");
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return {
      url: await getSignedUrl(createS3Client(), command, { expiresIn: expiresInSeconds }),
      expiresInSeconds
    };
  }

  localPath(key: string) {
    const root = localUploadRoot();
    const target = normalize(join(root, key));
    if (!target.startsWith(root)) {
      throw new Error("Invalid storage key.");
    }

    return target;
  }
}

function storageProvider(): StorageProvider {
  const provider = (process.env.STORAGE_PROVIDER ?? "LOCAL").toUpperCase();
  if (provider === "S3" || provider === "R2" || provider === "GCS") return provider;
  return "LOCAL";
}

function publicUrl(key: string, bucket: string) {
  const cdn = process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (cdn) return `${cdn}/${key}`;
  const endpoint = process.env.STORAGE_ENDPOINT?.replace(/\/$/, "");
  if (endpoint) return `${endpoint}/${bucket}/${key}`;
  return `https://${bucket}.s3.${process.env.STORAGE_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
}

function createS3Client() {
  return new S3Client({
    region: process.env.STORAGE_REGION ?? "auto",
    endpoint: process.env.STORAGE_ENDPOINT || undefined,
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: requiredEnv("STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("STORAGE_SECRET_ACCESS_KEY")
    }
  });
}

function localUploadRoot() {
  return normalize(join(process.cwd(), "../../storage/local-dev-only/uploads"));
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for object storage uploads.`);
  return value;
}
