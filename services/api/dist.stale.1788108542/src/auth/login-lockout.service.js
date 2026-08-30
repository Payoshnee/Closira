"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoginLockoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginLockoutService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const memoryFailures = new Map();
let LoginLockoutService = LoginLockoutService_1 = class LoginLockoutService {
    logger = new common_1.Logger(LoginLockoutService_1.name);
    redis;
    async isLocked(email) {
        const entry = await this.read(email);
        return Boolean(entry?.lockedUntil && entry.lockedUntil > Date.now());
    }
    async recordFailure(email) {
        const now = Date.now();
        const current = await this.read(email);
        const fresh = !current || now - current.firstFailureAt > loginLockWindowMs();
        const next = fresh ? { count: 1, firstFailureAt: now } : { ...current, count: current.count + 1 };
        if (next.count >= loginLockMaxFailures()) {
            next.lockedUntil = now + loginLockDurationMs();
        }
        await this.write(email, next);
    }
    async clear(email) {
        if (this.client()) {
            await this.client()?.del(keyFor(email));
            return;
        }
        memoryFailures.delete(email);
    }
    async read(email) {
        const redis = this.client();
        if (redis) {
            const raw = await redis.get(keyFor(email));
            return raw ? JSON.parse(raw) : undefined;
        }
        return memoryFailures.get(email);
    }
    async write(email, entry) {
        const ttl = Math.ceil(Math.max(loginLockWindowMs(), loginLockDurationMs()) / 1000);
        const redis = this.client();
        if (redis) {
            await redis.set(keyFor(email), JSON.stringify(entry), "EX", ttl);
            return;
        }
        memoryFailures.set(email, entry);
    }
    client() {
        if (!process.env.REDIS_URL)
            return undefined;
        if (!this.redis) {
            this.redis = new ioredis_1.default(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
            this.redis.on("error", (error) => this.logger.warn(`Redis lockout unavailable: ${error.message}`));
        }
        return this.redis;
    }
};
exports.LoginLockoutService = LoginLockoutService;
exports.LoginLockoutService = LoginLockoutService = LoginLockoutService_1 = __decorate([
    (0, common_1.Injectable)()
], LoginLockoutService);
function keyFor(email) {
    return `closira:auth:lockout:${email}`;
}
function loginLockWindowMs() {
    return Number(process.env.AUTH_LOCK_WINDOW_MS ?? 15 * 60 * 1000);
}
function loginLockMaxFailures() {
    return Number(process.env.AUTH_LOCK_MAX_FAILURES ?? 5);
}
function loginLockDurationMs() {
    return Number(process.env.AUTH_LOCK_DURATION_MS ?? 15 * 60 * 1000);
}
//# sourceMappingURL=login-lockout.service.js.map