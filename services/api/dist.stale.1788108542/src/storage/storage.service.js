"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
let StorageService = class StorageService {
    async createSignedUpload(input) {
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
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: input.key,
            ContentType: input.contentType,
            ContentLength: input.byteSize
        });
        const expiresInSeconds = Number(process.env.STORAGE_SIGNED_URL_TTL_SECONDS ?? 900);
        return {
            provider,
            storageKey: input.key,
            uploadUrl: await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: expiresInSeconds }),
            publicUrl: publicUrl(input.key, bucket),
            expiresInSeconds,
            headers: { "Content-Type": input.contentType }
        };
    }
    async deleteObject(key, provider = storageProvider()) {
        if (provider === "LOCAL") {
            const target = this.localPath(key);
            await (0, promises_1.unlink)(target).catch((error) => {
                if (error.code !== "ENOENT") {
                    throw error;
                }
            });
            return;
        }
        const bucket = requiredEnv("STORAGE_BUCKET");
        const client = createS3Client();
        await client.send(new client_s3_1.DeleteObjectCommand({ Bucket: bucket, Key: key }));
    }
    async readObjectBuffer(key, provider = storageProvider()) {
        if (provider === "LOCAL") {
            const { readFile } = await Promise.resolve().then(() => require("node:fs/promises"));
            return readFile(this.localPath(key));
        }
        const bucket = requiredEnv("STORAGE_BUCKET");
        const response = await createS3Client().send(new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key }));
        if (!response.Body) {
            throw new Error("Storage object body is empty.");
        }
        return Buffer.from(await response.Body.transformToByteArray());
    }
    async writeObject(key, body, contentType, provider = storageProvider()) {
        if (provider === "LOCAL") {
            const { mkdir, writeFile } = await Promise.resolve().then(() => require("node:fs/promises"));
            const { dirname } = await Promise.resolve().then(() => require("node:path"));
            const target = this.localPath(key);
            await mkdir(dirname(target), { recursive: true });
            await writeFile(target, body);
            return;
        }
        const bucket = requiredEnv("STORAGE_BUCKET");
        await createS3Client().send(new client_s3_1.PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
    }
    async createSignedRead(key, provider = storageProvider()) {
        const expiresInSeconds = Number(process.env.STORAGE_READ_URL_TTL_SECONDS ?? 300);
        if (provider === "LOCAL") {
            return {
                url: `/api/v1/uploads/local/${encodeURIComponent(key)}`,
                expiresInSeconds
            };
        }
        const bucket = requiredEnv("STORAGE_BUCKET");
        const command = new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key });
        return {
            url: await (0, s3_request_presigner_1.getSignedUrl)(createS3Client(), command, { expiresIn: expiresInSeconds }),
            expiresInSeconds
        };
    }
    localPath(key) {
        const root = localUploadRoot();
        const target = (0, node_path_1.normalize)((0, node_path_1.join)(root, key));
        if (!target.startsWith(root)) {
            throw new Error("Invalid storage key.");
        }
        return target;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)()
], StorageService);
function storageProvider() {
    const provider = (process.env.STORAGE_PROVIDER ?? "LOCAL").toUpperCase();
    if (provider === "S3" || provider === "R2" || provider === "GCS")
        return provider;
    return "LOCAL";
}
function publicUrl(key, bucket) {
    const cdn = process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (cdn)
        return `${cdn}/${key}`;
    const endpoint = process.env.STORAGE_ENDPOINT?.replace(/\/$/, "");
    if (endpoint)
        return `${endpoint}/${bucket}/${key}`;
    return `https://${bucket}.s3.${process.env.STORAGE_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
}
function createS3Client() {
    return new client_s3_1.S3Client({
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
    return (0, node_path_1.normalize)((0, node_path_1.join)(process.cwd(), "../../storage/local-dev-only/uploads"));
}
function requiredEnv(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`${name} is required for object storage uploads.`);
    return value;
}
//# sourceMappingURL=storage.service.js.map