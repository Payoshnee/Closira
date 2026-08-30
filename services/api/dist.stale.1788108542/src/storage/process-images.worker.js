"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const image_processing_service_1 = require("./image-processing.service");
const storage_service_1 = require("./storage.service");
const prisma = new client_1.PrismaClient();
const imageProcessing = new image_processing_service_1.ImageProcessingService(new storage_service_1.StorageService());
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
        }
        catch (error) {
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
function jsonObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}
//# sourceMappingURL=process-images.worker.js.map