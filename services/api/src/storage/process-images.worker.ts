import { PrismaClient } from "@prisma/client";
import { ImageProcessingService } from "./image-processing.service";
import { StorageService } from "./storage.service";

const prisma = new PrismaClient();
const imageProcessing = new ImageProcessingService(new StorageService());

async function main() {
  const batchSize = Number(process.env.IMAGE_PROCESSING_BATCH_SIZE ?? 25);
  const candidates = await prisma.wardrobeImage.findMany({
    orderBy: { createdAt: "asc" },
    take: batchSize * 3
  });
  const pending = candidates.filter((image) => {
    const analysis = jsonObject(image.analysis);
    return !analysis.processedAt && !analysis.processingFailedAt;
  }).slice(0, batchSize);

  for (const image of pending) {
    try {
      const processed = await imageProcessing.processImageVariants(image.storageKey, image.provider);
      await prisma.wardrobeImage.update({
        where: { id: image.id },
        data: {
          storageKey: processed.variants.detail.key,
          url: "",
          contentType: "image/webp",
          byteSize: processed.variants.detail.byteSize,
          width: processed.variants.detail.width,
          height: processed.variants.detail.height,
          analysis: {
            ...jsonObject(image.analysis),
            processedAt: new Date().toISOString(),
            originalStorageKey: image.storageKey,
            original: processed.original,
            variants: processed.variants
          }
        }
      });
      console.log(`processed ${image.id}`);
    } catch (error) {
      await prisma.wardrobeImage.update({
        where: { id: image.id },
        data: {
          analysis: {
            ...jsonObject(image.analysis),
            processingFailedAt: new Date().toISOString(),
            processingError: error instanceof Error ? error.message : "Unknown image processing error"
          }
        }
      });
      console.error(`failed ${image.id}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`image processing batch complete: ${pending.length} checked`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function jsonObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
