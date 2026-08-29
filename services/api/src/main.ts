import { LogLevel, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: readLogLevels()
  });
  app.setGlobalPrefix("api/v1");

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(json({ limit: process.env.JSON_BODY_LIMIT ?? "1mb" }));
  app.use(urlencoded({ extended: true, limit: process.env.FORM_BODY_LIMIT ?? "1mb" }));
  app.use(cookieParser());

  app.use(
    "/api/v1/auth",
    rateLimit({
      windowMs: readNumberEnv("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
      limit: readNumberEnv("AUTH_RATE_LIMIT_MAX", 20),
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(
    rateLimit({
      windowMs: readNumberEnv("RATE_LIMIT_WINDOW_MS", 60 * 1000),
      limit: readNumberEnv("RATE_LIMIT_MAX", 300),
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      whitelist: true
    })
  );
  app.enableCors({
    origin: readCorsOrigins(),
    credentials: true
  });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

function readCorsOrigins() {
  const configured = process.env.CORS_ORIGINS ?? process.env.WEB_ORIGIN ?? "http://localhost:3000";
  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function readNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readLogLevels(): LogLevel[] {
  const configured = process.env.LOG_LEVELS;
  if (configured) {
    return configured
      .split(",")
      .map((level) => level.trim())
      .filter(isLogLevel);
  }

  return process.env.NODE_ENV === "production" ? ["log", "error", "warn"] : ["log", "error", "warn", "debug", "verbose"];
}

function isLogLevel(level: string): level is LogLevel {
  return ["log", "error", "warn", "debug", "verbose", "fatal"].includes(level);
}

void bootstrap();
