import { Injectable } from "@nestjs/common";
import { StorageProvider } from "@prisma/client";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

@Injectable()
export class StorageService {
  async createSignedUpload(input: SignedUploadInput): Promise<SignedUpload> {
    const provider = storageProvider();
    if (provider === "LOCAL") {
      return {
        provider,
        storageKey: input.key,
        uploadUrl: `/api/v1/uploads/local/${encodeURIComponent(input.key)}`,
        publicUrl: `/uploads/${input.key}`,
        expiresInSeconds: 900
      };
    }

    const bucket = requiredEnv("STORAGE_BUCKET");
    const client = new S3Client({
      region: process.env.STORAGE_REGION ?? "auto",
      endpoint: process.env.STORAGE_ENDPOINT || undefined,
      forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: requiredEnv("STORAGE_ACCESS_KEY_ID"),
        secretAccessKey: requiredEnv("STORAGE_SECRET_ACCESS_KEY")
      }
    });
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

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for object storage uploads.`);
  return value;
}
