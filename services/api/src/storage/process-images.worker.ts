import { PrismaClient } from "@prisma/client";
import { ImageProcessingService } from "./image-processing.service";
import { StorageService } from "./storage.service";

const prisma = new PrismaClient();
const imageProcessing = new ImageProcessingService(new StorageService());

async function main() {
  const batchSize = Number(process.env.IMAGE_PROCESSING_BATCH_SIZE ?? 25);
  const pending = await prisma.wardrobeImage.findMany({
    where: {
      analysis: {
        path: ["processedAt"],
        equals: undefined
      }
    },
    orderBy: { createdAt: "asc" },
    take: batchSize
  });

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
            ...(typeof image.analysis === "object" && image.analysis && !Array.isArray(image.analysis) ? image.analysis : {}),
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
            ...(typeof image.analysis === "object" && image.analysis && !Array.isArray(image.analysis) ? image.analysis : {}),
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
