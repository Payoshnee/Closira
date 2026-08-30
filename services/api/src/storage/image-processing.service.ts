import { BadRequestException, Injectable } from "@nestjs/common";
import { StorageProvider } from "@prisma/client";
import sharp from "sharp";
import { StorageService } from "./storage.service";

export type ProcessedImage = {
  original: { key: string; width: number; height: number; format: string };
  variants: Record<"thumbnail" | "card" | "detail", { key: string; width: number; height: number; byteSize: number; contentType: string }>;
};

@Injectable()
export class ImageProcessingService {
  constructor(private readonly storage: StorageService) {}

  async processImageVariants(storageKey: string, provider: StorageProvider): Promise<ProcessedImage> {
    const source = await this.storage.readObjectBuffer(storageKey, provider);
    const metadata = await sharp(source).metadata();
    if (!metadata.width || !metadata.height) {
      throw new BadRequestException("Uploaded file is not a readable image.");
    }
    if (metadata.width < 100 || metadata.height < 100) {
      throw new BadRequestException("Image must be at least 100x100 pixels.");
    }

    const variants = {
      thumbnail: await this.createVariant(source, storageKey, "thumb", 320, provider),
      card: await this.createVariant(source, storageKey, "card", 720, provider),
      detail: await this.createVariant(source, storageKey, "detail", 1800, provider)
    };

    return {
      original: {
        key: storageKey,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format ?? "unknown"
      },
      variants
    };
  }

  private async createVariant(source: Buffer, storageKey: string, variant: string, maxSize: number, provider: StorageProvider) {
    const key = toVariantKey(storageKey, variant);
    const result = await sharp(source)
      .rotate()
      .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
      .webp({ quality: variant === "thumbnail" ? 78 : 84 })
      .toBuffer({ resolveWithObject: true });

    await this.storage.writeObject(key, result.data, "image/webp", provider);

    return {
      key,
      width: result.info.width,
      height: result.info.height,
      byteSize: result.data.byteLength,
      contentType: "image/webp"
    };
  }
}

function toVariantKey(storageKey: string, variant: string) {
  return storageKey.replace(/(\.[a-zA-Z0-9]+)?$/, `.${variant}.webp`);
}
