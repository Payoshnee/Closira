"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const cookie_parser_1 = require("cookie-parser");
const express_1 = require("express");
const express_rate_limit_1 = require("express-rate-limit");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: false,
        logger: readLogLevels()
    });
    app.setGlobalPrefix("api/v1");
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    app.use((0, express_1.json)({ limit: process.env.JSON_BODY_LIMIT ?? "1mb" }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: process.env.FORM_BODY_LIMIT ?? "1mb" }));
    app.use((0, cookie_parser_1.default)());
    app.use("/api/v1/auth", (0, express_rate_limit_1.default)({
        windowMs: readNumberEnv("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
        limit: readNumberEnv("AUTH_RATE_LIMIT_MAX", 20),
        standardHeaders: true,
        legacyHeaders: false
    }));
    app.use((0, express_rate_limit_1.default)({
        windowMs: readNumberEnv("RATE_LIMIT_WINDOW_MS", 60 * 1000),
        limit: readNumberEnv("RATE_LIMIT_MAX", 300),
        standardHeaders: true,
        legacyHeaders: false
    }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        forbidUnknownValues: true,
        transform: true,
        whitelist: true
    }));
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
function readNumberEnv(name, fallback) {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}
function readLogLevels() {
    const configured = process.env.LOG_LEVELS;
    if (configured) {
        return configured
            .split(",")
            .map((level) => level.trim())
            .filter(isLogLevel);
    }
    return process.env.NODE_ENV === "production" ? ["log", "error", "warn"] : ["log", "error", "warn", "debug", "verbose"];
}
function isLogLevel(level) {
    return ["log", "error", "warn", "debug", "verbose", "fatal"].includes(level);
}
void bootstrap();
//# sourceMappingURL=main.js.map