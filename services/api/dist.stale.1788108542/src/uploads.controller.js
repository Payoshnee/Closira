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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const storage_service_1 = require("./storage/storage.service");
let UploadsController = class UploadsController {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    async uploadLocal(encodedStorageKey, request) {
        const storageKey = decodeURIComponent(encodedStorageKey);
        const target = this.safeLocalPath(storageKey);
        await (0, promises_1.mkdir)((0, node_path_1.dirname)(target), { recursive: true });
        await new Promise((resolve, reject) => {
            const stream = (0, node_fs_1.createWriteStream)(target);
            request.pipe(stream);
            request.on("error", reject);
            stream.on("error", reject);
            stream.on("finish", resolve);
        });
        return { ok: true, storageKey, localPath: target };
    }
    async readLocal(encodedStorageKey, response) {
        const storageKey = decodeURIComponent(encodedStorageKey);
        const target = this.safeLocalPath(storageKey);
        (0, node_fs_1.createReadStream)(target)
            .on("error", () => response.status(404).json({ message: "File not found." }))
            .pipe(response);
    }
    safeLocalPath(storageKey) {
        try {
            return this.storage.localPath(storageKey);
        }
        catch {
            throw new common_1.BadRequestException("Invalid upload path.");
        }
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Put)("local/:storageKey"),
    __param(0, (0, common_1.Param)("storageKey")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadLocal", null);
__decorate([
    (0, common_1.Get)("local/:storageKey"),
    (0, common_1.Header)("Cache-Control", "private, max-age=300"),
    __param(0, (0, common_1.Param)("storageKey")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "readLocal", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)("uploads"),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map