import type { Request, Response } from "express";
import { StorageService } from "./storage/storage.service";
export declare class UploadsController {
    private readonly storage;
    constructor(storage: StorageService);
    uploadLocal(encodedStorageKey: string, request: Request): Promise<{
        ok: boolean;
        storageKey: string;
        localPath: string;
    }>;
    readLocal(encodedStorageKey: string, response: Response): Promise<void>;
    private safeLocalPath;
}
