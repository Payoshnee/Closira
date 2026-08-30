"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessingService = void 0;
const common_1 = require("@nestjs/common");
const sharp_1 = require("sharp");
const storage_service_1 = require("./storage.service");
let ImageProcessingService = class ImageProcessingService {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    async processImageVariants(storageKey, provider) {
        const source = await this.storage.readObjectBuffer(storageKey, provider);
        const metadata = await (0, sharp_1.default)(source).metadata();
        if (!metadata.width || !metadata.height) {
            throw new common_1.BadRequestException("Uploaded file is not a readable image.");
        }
        if (metadata.width < 100 || metadata.height < 100) {
            throw new common_1.BadRequestException("Image must be at least 100x100 pixels.");
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
    async createVariant(source, storageKey, variant, maxSize, provider) {
        const key = toVariantKey(storageKey, variant);
        const result = await (0, sharp_1.default)(source)
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
};
exports.ImageProcessingService = ImageProcessingService;
exports.ImageProcessingService = ImageProcessingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], ImageProcessingService);
function toVariantKey(storageKey, variant) {
    return storageKey.replace(/(\.[a-zA-Z0-9]+)?$/, `.${variant}.webp`);
}
//# sourceMappingURL=image-processing.service.js.map