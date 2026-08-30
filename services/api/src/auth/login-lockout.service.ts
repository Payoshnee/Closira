import { Injectable, Logger } from "@nestjs/common";
import Redis from "ioredis";

type LockoutEntry = { count: number; firstFailureAt: number; lockedUntil?: number };

const memoryFailures = new Map<string, LockoutEntry>();

@Injectable()
export class LoginLockoutService {
  private readonly logger = new Logger(LoginLockoutService.name);
  private redis?: Redis;

  async isLocked(email: string) {
    const entry = await this.read(email);
    return Boolean(entry?.lockedUntil && entry.lockedUntil > Date.now());
  }

  async recordFailure(email: string) {
    const now = Date.now();
    const current = await this.read(email);
    const fresh = !current || now - current.firstFailureAt > loginLockWindowMs();
    const next: LockoutEntry = fresh ? { count: 1, firstFailureAt: now } : { ...current, count: current.count + 1 };
    if (next.count >= loginLockMaxFailures()) {
      next.lockedUntil = now + loginLockDurationMs();
    }
    await this.write(email, next);
  }

  async clear(email: string) {
    if (this.client()) {
      await this.client()?.del(keyFor(email));
      return;
    }
    memoryFailures.delete(email);
  }

  private async read(email: string): Promise<LockoutEntry | undefined> {
    const redis = this.client();
    if (redis) {
      const raw = await redis.get(keyFor(email));
      return raw ? (JSON.parse(raw) as LockoutEntry) : undefined;
    }
    return memoryFailures.get(email);
  }

  private async write(email: string, entry: LockoutEntry) {
    const ttl = Math.ceil(Math.max(loginLockWindowMs(), loginLockDurationMs()) / 1000);
    const redis = this.client();
    if (redis) {
      await redis.set(keyFor(email), JSON.stringify(entry), "EX", ttl);
      return;
    }
    memoryFailures.set(email, entry);
  }

  private client() {
    if (!process.env.REDIS_URL) return undefined;
    if (!this.redis) {
      this.redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
      this.redis.on("error", (error) => this.logger.warn(`Redis lockout unavailable: ${error.message}`));
    }
    return this.redis;
  }
}

function keyFor(email: string) {
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
