import { StorageProvider } from "@prisma/client";
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
export declare class StorageService {
    createSignedUpload(input: SignedUploadInput): Promise<SignedUpload>;
    deleteObject(key: string, provider?: import(".prisma/client").$Enums.StorageProvider): Promise<void>;
    readObjectBuffer(key: string, provider?: import(".prisma/client").$Enums.StorageProvider): Promise<NonSharedBuffer>;
    writeObject(key: string, body: Buffer, contentType: string, provider?: import(".prisma/client").$Enums.StorageProvider): Promise<void>;
    createSignedRead(key: string, provider?: import(".prisma/client").$Enums.StorageProvider): Promise<SignedRead>;
    localPath(key: string): string;
}
