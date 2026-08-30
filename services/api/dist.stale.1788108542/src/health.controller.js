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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let HealthController = class HealthController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getHealth() {
        return this.getLive();
    }
    getLive() {
        return {
            status: "ok",
            service: "closira-api",
            uptimeSeconds: Math.round(process.uptime()),
            timestamp: new Date().toISOString()
        };
    }
    async getReady() {
        const checks = {
            database: await this.checkDatabase(),
            redis: await this.checkRedis(),
            aiService: await this.checkAiService()
        };
        const ready = Object.values(checks).every((check) => check.status === "ok" || check.status === "skipped");
        const response = {
            status: ready ? "ok" : "error",
            service: "closira-api",
            checks,
            timestamp: new Date().toISOString()
        };
        if (!ready) {
            throw new common_1.ServiceUnavailableException(response);
        }
        return response;
    }
    async checkDatabase() {
        if (!this.prisma) {
            return { status: "skipped", message: "Prisma service is not available in this context." };
        }
        const startedAt = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return { status: "ok", latencyMs: Date.now() - startedAt };
        }
        catch (error) {
            return { status: "error", latencyMs: Date.now() - startedAt, message: readErrorMessage(error) };
        }
    }
    async checkRedis() {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            return { status: "skipped", message: "REDIS_URL is not configured." };
        }
        const startedAt = Date.now();
        try {
            const url = new URL(redisUrl);
            await checkTcpConnection(url.hostname, Number(url.port || 6379), 1500);
            return { status: "ok", latencyMs: Date.now() - startedAt };
        }
        catch (error) {
            return { status: "error", latencyMs: Date.now() - startedAt, message: readErrorMessage(error) };
        }
    }
    async checkAiService() {
        const aiServiceUrl = process.env.AI_SERVICE_URL;
        if (!aiServiceUrl) {
            return { status: "skipped", message: "AI_SERVICE_URL is not configured." };
        }
        const startedAt = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        try {
            const response = await fetch(`${aiServiceUrl.replace(/\/$/, "")}/health`, { signal: controller.signal });
            if (!response.ok) {
                return { status: "error", latencyMs: Date.now() - startedAt, message: `AI health returned ${response.status}.` };
            }
            return { status: "ok", latencyMs: Date.now() - startedAt };
        }
        catch (error) {
            return { status: "error", latencyMs: Date.now() - startedAt, message: readErrorMessage(error) };
        }
        finally {
            clearTimeout(timeout);
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)("live"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getLive", null);
__decorate([
    (0, common_1.Get)("ready"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReady", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)("health"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthController);
async function checkTcpConnection(host, port, timeoutMs) {
    const net = await Promise.resolve().then(() => require("net"));
    return new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port });
        const timeout = setTimeout(() => {
            socket.destroy();
            reject(new Error(`Connection timed out after ${timeoutMs}ms.`));
        }, timeoutMs);
        socket.once("connect", () => {
            clearTimeout(timeout);
            socket.end();
            resolve();
        });
        socket.once("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}
function readErrorMessage(error) {
    return error instanceof Error ? error.message : "Unknown error";
}
//# sourceMappingURL=health.controller.js.map