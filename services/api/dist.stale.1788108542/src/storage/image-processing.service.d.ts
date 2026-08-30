import { StorageProvider } from "@prisma/client";
import { StorageService } from "./storage.service";
export type ProcessedImage = {
    original: {
        key: string;
        width: number;
        height: number;
        format: string;
    };
    variants: Record<"thumbnail" | "card" | "detail", {
        key: string;
        width: number;
        height: number;
        byteSize: number;
        contentType: string;
    }>;
};
export declare class ImageProcessingService {
    private readonly storage;
    constructor(storage: StorageService);
    processImageVariants(storageKey: string, provider: StorageProvider): Promise<ProcessedImage>;
    private createVariant;
}
