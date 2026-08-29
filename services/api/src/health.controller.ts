import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

type DependencyCheck = {
  status: "ok" | "error" | "skipped";
  latencyMs?: number;
  message?: string;
};

@Controller("health")
export class HealthController {
  constructor(private readonly prisma?: PrismaService) {}

  @Get()
  getHealth() {
    return this.getLive();
  }

  @Get("live")
  getLive() {
    return {
      status: "ok",
      service: "closira-api",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    };
  }

  @Get("ready")
  @HttpCode(HttpStatus.OK)
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
      throw new ServiceUnavailableException(response);
    }

    return response;
  }

  private async checkDatabase(): Promise<DependencyCheck> {
    if (!this.prisma) {
      return { status: "skipped", message: "Prisma service is not available in this context." };
    }

    const startedAt = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", latencyMs: Date.now() - startedAt };
    } catch (error) {
      return { status: "error", latencyMs: Date.now() - startedAt, message: readErrorMessage(error) };
    }
  }

  private async checkRedis(): Promise<DependencyCheck> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return { status: "skipped", message: "REDIS_URL is not configured." };
    }

    const startedAt = Date.now();
    try {
      const url = new URL(redisUrl);
      await checkTcpConnection(url.hostname, Number(url.port || 6379), 1500);
      return { status: "ok", latencyMs: Date.now() - startedAt };
    } catch (error) {
      return { status: "error", latencyMs: Date.now() - startedAt, message: readErrorMessage(error) };
    }
  }

  private async checkAiService(): Promise<DependencyCheck> {
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
    } catch (error) {
      return { status: "error", latencyMs: Date.now() - startedAt, message: readErrorMessage(error) };
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function checkTcpConnection(host: string, port: number, timeoutMs: number) {
  const net = await import("net");

  return new Promise<void>((resolve, reject) => {
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

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
