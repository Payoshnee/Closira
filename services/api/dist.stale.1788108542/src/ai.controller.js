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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth/auth.service");
const entitlements_service_1 = require("./billing/entitlements.service");
const current_user_1 = require("./auth/current-user");
const prisma_service_1 = require("./prisma.service");
const storage_service_1 = require("./storage/storage.service");
const wardrobe_mapper_1 = require("./wardrobe.mapper");
const supportedProviders = [
    { id: "native", name: "Closira Native AI", requiresApiKey: false },
    { id: "openai", name: "ChatGPT / OpenAI", requiresApiKey: true },
    { id: "anthropic", name: "Claude / Anthropic", requiresApiKey: true },
    { id: "gemini", name: "Gemini / Google", requiresApiKey: true },
    { id: "azure-openai", name: "Azure OpenAI", requiresApiKey: true, endpointLabel: "Azure endpoint" },
    { id: "ollama", name: "Ollama", requiresApiKey: false, endpointLabel: "Local Ollama URL" },
    { id: "custom", name: "Custom OpenAI-compatible API", requiresApiKey: true, endpointLabel: "Base URL" }
];
let AiController = class AiController {
    prisma;
    auth;
    entitlements;
    storage;
    constructor(prisma, auth, entitlements, storage) {
        this.prisma = prisma;
        this.auth = auth;
        this.entitlements = entitlements;
        this.storage = storage;
    }
    async getSettings(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const settings = await this.prisma.aiProviderSetting.findMany({ where: { userId: user.id } });
        const active = settings.find((setting) => setting.isDefault && setting.isEnabled) ?? settings.find((setting) => setting.isEnabled);
        return {
            activeProvider: toWebProvider(active?.provider ?? "NATIVE"),
            nativeEnabled: settings.some((setting) => setting.provider === "NATIVE" && setting.isEnabled) || settings.length === 0,
            connectedProviders: settings.filter((setting) => setting.isEnabled).map((setting) => toWebProvider(setting.provider)),
            supportedProviders
        };
    }
    async updateSettings(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const provider = toDbProvider(body.activeProvider ?? body.provider ?? "native");
        await this.prisma.$transaction([
            this.prisma.aiProviderSetting.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
            this.prisma.aiProviderSetting.upsert({
                where: { userId_provider: { userId: user.id, provider } },
                update: {
                    isEnabled: true,
                    isDefault: true,
                    model: body.model,
                    baseUrl: body.baseUrl,
                    encryptedSecret: body.apiKey ? maskSecret(body.apiKey) : undefined,
                    lastValidatedAt: new Date()
                },
                create: {
                    userId: user.id,
                    provider,
                    displayName: supportedProviders.find((item) => item.id === toWebProvider(provider))?.name ?? provider,
                    isEnabled: true,
                    isDefault: true,
                    model: body.model,
                    baseUrl: body.baseUrl,
                    encryptedSecret: body.apiKey ? maskSecret(body.apiKey) : undefined,
                    lastValidatedAt: new Date()
                }
            })
        ]);
        return this.getSettings(request);
    }
    async recommendOutfit(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const provider = await this.activeProvider(user.id);
        await this.entitlements.requireAiRequest(user.id);
        await this.entitlements.requireProvider(user.id, provider.provider);
        const wardrobe = await this.userWardrobe(user.id);
        const job = await this.createJob(user.id, provider.provider, "OUTFIT_RECOMMENDATION", { prompt: body.prompt, occasion: body.occasion });
        try {
            const native = normalizeRecommendation(await this.callProviderRecommendation(provider, body, wardrobe));
            const result = {
                id: job.id,
                prompt: body.prompt ?? `Recommend an outfit for ${body.occasion ?? "today"}`,
                title: native.title,
                confidence: native.confidence,
                occasion: native.occasion ?? body.occasion ?? "Daily",
                explanation: native.explanation,
                items: native.items?.length ? native.items : wardrobe.slice(0, 3),
                provider: toWebProvider(provider.provider),
                fallbackUsed: native.fallback_used ?? false
            };
            await this.finishJob(job.id, result, result.confidence, result.fallbackUsed);
            return result;
        }
        catch (error) {
            const fallback = this.localStylistFallback(job.id, body, wardrobe, provider.provider);
            await this.finishJob(job.id, fallback, fallback.confidence, true, error);
            return fallback;
        }
    }
    async listRecommendations(request) {
        const prompts = [
            "Create a polished dinner outfit using items I have not worn recently.",
            "Style me for an office presentation with a clean, elegant, confident look.",
            "Suggest a wedding guest outfit with rose or gold tones from my wardrobe.",
            "Build a comfortable travel outfit that still looks put together.",
            "Give me a minimalist capsule outfit using neutral colors and reusable pieces."
        ];
        return Promise.all(prompts.map((prompt) => this.recommendOutfit(request, { prompt })));
    }
    async shoppingCheck(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const provider = await this.activeProvider(user.id);
        await this.entitlements.requireAiRequest(user.id);
        await this.entitlements.requireProvider(user.id, provider.provider);
        const wardrobe = await this.userWardrobe(user.id);
        const job = await this.createJob(user.id, provider.provider, "SHOPPING_CHECK", body);
        try {
            const native = normalizeShopping(await this.callProviderShopping(provider, body.itemName ?? "New item", body.occasion, wardrobe));
            const result = {
                id: job.id,
                itemName: body.itemName ?? "New item",
                recommendation: native.recommendation,
                compatibilityScore: native.compatibility_score,
                duplicateRisk: native.duplicate_risk,
                explanation: native.explanation,
                similarItems: native.similar_items ?? [],
                provider: toWebProvider(provider.provider),
                fallbackUsed: native.fallback_used ?? false
            };
            await this.finishJob(job.id, result, result.compatibilityScore / 100, result.fallbackUsed);
            return result;
        }
        catch (error) {
            const result = this.localShoppingFallback(job.id, body.itemName ?? "New item", wardrobe, provider.provider);
            await this.finishJob(job.id, result, result.compatibilityScore / 100, true, error);
            return result;
        }
    }
    async listShoppingChecks(request) {
        return Promise.all([
            this.shoppingCheck(request, { itemName: "Cream oversized blazer", occasion: "Office" }),
            this.shoppingCheck(request, { itemName: "Silver strappy heels", occasion: "Wedding" })
        ]);
    }
    async analyzeItem(request, itemId) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.entitlements.requireAiRequest(user.id);
        const provider = await this.activeProvider(user.id);
        await this.entitlements.requireProvider(user.id, provider.provider);
        const item = await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id: itemId, userId: user.id }, include: wardrobe_mapper_1.itemInclude });
        const image = item.images.find((candidate) => candidate.isPrimary) ?? item.images[0];
        const job = await this.createJob(user.id, provider.provider, "CLOTHING_ANALYSIS", { itemId, imageId: image?.id });
        let analysis;
        let fallbackUsed = false;
        try {
            analysis = normalizeClothingAnalysis(await this.callProviderClothingAnalysis(provider, item, image));
        }
        catch (error) {
            analysis = normalizeClothingAnalysis(await this.callNativeClothingAnalysis(item));
            analysis.provider_error = error instanceof Error ? error.message : "External AI provider failed.";
            fallbackUsed = true;
        }
        await this.prisma.wardrobeImage.updateMany({
            where: { itemId: item.id, isPrimary: true },
            data: { analysis: analysis }
        });
        await this.applyAutoTags(user.id, item.id, analysis.suggested_tags);
        await this.finishJob(job.id, analysis, Number(analysis.confidence ?? 0), fallbackUsed || Boolean(analysis.fallback_used));
        return analysis;
    }
    async embedItem(request, itemId) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.entitlements.requireAiRequest(user.id);
        const item = await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id: itemId, userId: user.id }, include: { images: true } });
        const job = await this.createJob(user.id, "NATIVE", "IMAGE_EMBEDDING", { itemId });
        const result = await postJson(`${aiServiceUrl()}/embed-image`, { item_name: item.name, image_url: item.images[0]?.url });
        const vector = normalizeEmbedding(result.embedding);
        await this.prisma.$executeRawUnsafe(`INSERT INTO image_embeddings (item_id, image_id, model, dimension, embedding) VALUES ($1::uuid, $2::uuid, $3, 768, $4::vector)`, item.id, item.images[0]?.id ?? null, result.model ?? "closira-native-embedding-v0", `[${vector.join(",")}]`);
        await this.finishJob(job.id, result, 0.8, Boolean(result.fallback_used));
        return { ...result, dimensions: 768 };
    }
    async similarItems(request, itemId) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id: itemId, userId: user.id } });
        const source = await this.prisma.$queryRaw `
      SELECT embedding::text AS embedding
      FROM image_embeddings
      WHERE item_id = ${itemId}::uuid
      ORDER BY created_at DESC
      LIMIT 1
    `;
        if (!source[0])
            return [];
        const rows = await this.prisma.$queryRaw `
      SELECT e.item_id, e.embedding <=> ${source[0].embedding}::vector AS distance
      FROM image_embeddings e
      JOIN wardrobe_items w ON w.id = e.item_id
      WHERE e.item_id <> ${itemId}::uuid
        AND w.user_id = ${user.id}::uuid
        AND w.status = 'ACTIVE'
      ORDER BY e.embedding <=> ${source[0].embedding}::vector
      LIMIT 8
    `;
        const items = await this.prisma.wardrobeItem.findMany({
            where: { id: { in: rows.map((row) => row.item_id) }, userId: user.id },
            include: wardrobe_mapper_1.itemInclude
        });
        const byId = new Map(items.map((item) => [item.id, (0, wardrobe_mapper_1.toWardrobeItem)(item)]));
        return rows.map((row) => ({ item: byId.get(row.item_id), similarity: Number((1 - row.distance).toFixed(4)) })).filter((row) => row.item);
    }
    async activeProvider(userId) {
        const setting = (await this.prisma.aiProviderSetting.findFirst({ where: { userId, isDefault: true, isEnabled: true } })) ??
            (await this.prisma.aiProviderSetting.upsert({
                where: { userId_provider: { userId, provider: "NATIVE" } },
                update: { isEnabled: true, isDefault: true },
                create: { userId, provider: "NATIVE", displayName: "Closira Native AI", isEnabled: true, isDefault: true, model: "closira-baseline" }
            }));
        return setting;
    }
    async userWardrobe(userId) {
        const items = await this.prisma.wardrobeItem.findMany({ where: { userId, status: "ACTIVE" }, include: wardrobe_mapper_1.itemInclude, orderBy: { updatedAt: "desc" } });
        return items.map(wardrobe_mapper_1.toWardrobeItem);
    }
    async callProviderRecommendation(provider, body, wardrobeItems) {
        if (provider.provider !== "NATIVE") {
            const external = await this.callExternalTextProvider(provider, stylistPrompt(body.prompt, body.occasion, wardrobeItems));
            return {
                title: external.title ?? inferTitle(body.prompt ?? ""),
                occasion: body.occasion ?? inferOccasion(body.prompt ?? ""),
                items: wardrobeItems.slice(0, 3),
                confidence: external.confidence ?? 0.74,
                explanation: external.explanation,
                fallback_used: false
            };
        }
        return postJson(`${aiServiceUrl()}/recommend-outfit`, {
            prompt: body.prompt,
            occasion: body.occasion,
            wardrobe_items: wardrobeItems
        });
    }
    async callProviderShopping(provider, itemName, occasion, wardrobeItems) {
        if (provider.provider !== "NATIVE") {
            const external = await this.callExternalTextProvider(provider, shoppingPrompt(itemName, occasion, wardrobeItems));
            return {
                recommendation: external.recommendation ?? "consider",
                compatibility_score: external.compatibilityScore ?? external.compatibility_score ?? 70,
                duplicate_risk: external.duplicateRisk ?? external.duplicate_risk ?? "medium",
                similar_items: wardrobeItems.slice(0, 3),
                explanation: external.explanation,
                fallback_used: false
            };
        }
        return postJson(`${aiServiceUrl()}/shopping-check`, {
            item_name: itemName,
            occasion,
            wardrobe_items: wardrobeItems
        });
    }
    async callProviderClothingAnalysis(provider, item, image) {
        if (provider.provider === "NATIVE") {
            return this.callNativeClothingAnalysis(item);
        }
        if (!image) {
            return this.callExternalTextProvider(provider, clothingAnalysisPrompt(item));
        }
        const source = await this.storage.readObjectBuffer(image.storageKey, image.provider);
        const imagePayload = {
            base64: source.toString("base64"),
            mediaType: image.contentType || "image/jpeg"
        };
        return this.callExternalVisionProvider(provider, clothingAnalysisPrompt(item), imagePayload);
    }
    async callNativeClothingAnalysis(item) {
        return postJson(`${aiServiceUrl()}/analyze-clothing`, {
            item_name: item.name,
            notes: [item.color, item.material, item.pattern, item.brand].filter(Boolean).join(" ")
        });
    }
    async callExternalTextProvider(provider, prompt) {
        const config = provider.config;
        const apiKey = config?.apiKeyEnv ? process.env[config.apiKeyEnv] : apiKeyFor(provider.provider);
        const model = provider.model ?? defaultModelFor(provider.provider);
        const baseUrl = provider.baseUrl ?? defaultBaseUrlFor(provider.provider);
        if (!apiKey && provider.provider !== "OLLAMA") {
            throw new Error(`${provider.provider} API key is not configured in environment.`);
        }
        if (provider.provider === "OPENAI" || provider.provider === "AZURE_OPENAI" || provider.provider === "CUSTOM") {
            const url = provider.provider === "AZURE_OPENAI" ? baseUrl : `${baseUrl.replace(/\/$/, "")}/chat/completions`;
            const response = await postJsonWithHeaders(url, {
                model,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            }, { Authorization: `Bearer ${apiKey}` });
            return parseAiJson(choiceText(response));
        }
        if (provider.provider === "ANTHROPIC") {
            const response = await postJsonWithHeaders(`${baseUrl.replace(/\/$/, "")}/v1/messages`, {
                model,
                max_tokens: 800,
                messages: [{ role: "user", content: prompt }]
            }, { "x-api-key": apiKey ?? "", "anthropic-version": "2023-06-01" });
            return parseAiJson(anthropicText(response));
        }
        if (provider.provider === "GEMINI") {
            const url = `${baseUrl.replace(/\/$/, "")}/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await postJsonWithHeaders(url, { contents: [{ parts: [{ text: prompt }] }] }, {});
            return parseAiJson(geminiText(response));
        }
        if (provider.provider === "OLLAMA") {
            const response = await postJsonWithHeaders(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
                model,
                prompt,
                stream: false,
                format: "json"
            }, {});
            return parseAiJson(typeof response.response === "string" ? response.response : "{}");
        }
        throw new Error(`Provider ${provider.provider} is not supported.`);
    }
    async callExternalVisionProvider(provider, prompt, image) {
        const config = provider.config;
        const apiKey = config?.apiKeyEnv ? process.env[config.apiKeyEnv] : apiKeyFor(provider.provider);
        const model = provider.model ?? defaultVisionModelFor(provider.provider);
        const baseUrl = provider.baseUrl ?? defaultBaseUrlFor(provider.provider);
        const dataUrl = `data:${image.mediaType};base64,${image.base64}`;
        if (!apiKey && provider.provider !== "OLLAMA") {
            throw new Error(`${provider.provider} API key is not configured in environment.`);
        }
        if (provider.provider === "OPENAI" || provider.provider === "AZURE_OPENAI" || provider.provider === "CUSTOM") {
            const url = provider.provider === "AZURE_OPENAI" ? baseUrl : `${baseUrl.replace(/\/$/, "")}/chat/completions`;
            const response = await postJsonWithHeaders(url, {
                model,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: dataUrl } }
                        ]
                    }
                ],
                response_format: { type: "json_object" }
            }, { Authorization: `Bearer ${apiKey}` });
            return parseAiJson(choiceText(response));
        }
        if (provider.provider === "ANTHROPIC") {
            const response = await postJsonWithHeaders(`${baseUrl.replace(/\/$/, "")}/v1/messages`, {
                model,
                max_tokens: 900,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.base64 } },
                            { type: "text", text: prompt }
                        ]
                    }
                ]
            }, { "x-api-key": apiKey ?? "", "anthropic-version": "2023-06-01" });
            return parseAiJson(anthropicText(response));
        }
        if (provider.provider === "GEMINI") {
            const url = `${baseUrl.replace(/\/$/, "")}/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await postJsonWithHeaders(url, {
                contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: image.mediaType, data: image.base64 } }] }]
            }, {});
            return parseAiJson(geminiText(response));
        }
        if (provider.provider === "OLLAMA") {
            const response = await postJsonWithHeaders(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
                model,
                prompt,
                images: [image.base64],
                stream: false,
                format: "json"
            }, {});
            return parseAiJson(typeof response.response === "string" ? response.response : "{}");
        }
        throw new Error(`Provider ${provider.provider} does not support clothing image analysis.`);
    }
    async createJob(userId, provider, type, input) {
        return this.prisma.aiJob.create({ data: { userId, provider, type, status: "RUNNING", input, startedAt: new Date() } });
    }
    async finishJob(id, output, confidence, fallbackUsed, error) {
        await this.prisma.aiJob.update({
            where: { id },
            data: {
                status: error ? "FALLBACK_USED" : fallbackUsed ? "FALLBACK_USED" : "SUCCEEDED",
                output: output,
                confidence,
                errorMessage: error instanceof Error ? error.message : undefined,
                finishedAt: new Date()
            }
        });
    }
    async applyAutoTags(userId, itemId, suggestedTags) {
        if (!Array.isArray(suggestedTags))
            return;
        for (const tagName of suggestedTags.filter((tag) => typeof tag === "string" && Boolean(tag.trim()))) {
            const name = tagName.trim();
            const slug = slugify(name);
            const tag = await this.prisma.tag.upsert({
                where: { userId_slug: { userId, slug } },
                update: { name },
                create: { userId, slug, name, color: "#be123c" }
            });
            await this.prisma.wardrobeTag.upsert({
                where: { itemId_tagId: { itemId, tagId: tag.id } },
                update: {},
                create: { itemId, tagId: tag.id }
            });
        }
    }
    localStylistFallback(id, body, wardrobe, provider) {
        const prompt = body.prompt ?? "";
        const lower = prompt.toLowerCase();
        const candidates = wardrobe.filter((item) => {
            const haystack = `${item.title} ${item.primaryColor} ${item.categoryName} ${item.material} ${item.tags.map((tag) => tag.name).join(" ")}`.toLowerCase();
            return ["wedding", "gold", "rose", "office", "travel", "neutral", "dinner"].some((word) => lower.includes(word) && haystack.includes(word));
        });
        const items = (candidates.length ? candidates : wardrobe).slice(0, 3);
        return {
            id,
            prompt,
            title: inferTitle(prompt),
            confidence: items.length ? 0.72 : 0.35,
            occasion: body.occasion ?? inferOccasion(prompt),
            explanation: "Fallback styling used wardrobe metadata because the configured AI service/provider was unavailable.",
            items,
            provider: toWebProvider(provider),
            fallbackUsed: true
        };
    }
    localShoppingFallback(id, itemName, wardrobe, provider) {
        const similar = wardrobe.filter((item) => itemName.toLowerCase().includes(item.primaryColor.toLowerCase()) || itemName.toLowerCase().includes(item.categoryName.toLowerCase())).slice(0, 3);
        return {
            id,
            itemName,
            recommendation: similar.length ? "consider" : "buy",
            compatibilityScore: similar.length ? 68 : 82,
            duplicateRisk: similar.length ? "medium" : "low",
            explanation: "Fallback shopping check used wardrobe metadata similarity because AI inference was unavailable.",
            similarItems: similar,
            provider: toWebProvider(provider),
            fallbackUsed: true
        };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)("settings"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)("settings"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)("recommend-outfit"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "recommendOutfit", null);
__decorate([
    (0, common_1.Get)("recommendations"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "listRecommendations", null);
__decorate([
    (0, common_1.Post)("shopping-check"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "shoppingCheck", null);
__decorate([
    (0, common_1.Get)("shopping-checks"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "listShoppingChecks", null);
__decorate([
    (0, common_1.Post)("items/:itemId/analyze"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("itemId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analyzeItem", null);
__decorate([
    (0, common_1.Post)("items/:itemId/embed"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("itemId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "embedItem", null);
__decorate([
    (0, common_1.Get)("items/:itemId/similar"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("itemId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "similarItems", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)("ai"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService,
        entitlements_service_1.EntitlementsService,
        storage_service_1.StorageService])
], AiController);
async function postJson(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!response.ok)
        throw new Error(`AI request failed with status ${response.status}`);
    return response.json();
}
async function postJsonWithHeaders(url, body, headers) {
    const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body)
    });
    if (!response.ok)
        throw new Error(`Provider request failed with status ${response.status}`);
    return response.json();
}
function aiServiceUrl() {
    return process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8000";
}
function toDbProvider(provider) {
    const map = {
        native: "NATIVE",
        openai: "OPENAI",
        anthropic: "ANTHROPIC",
        gemini: "GEMINI",
        "azure-openai": "AZURE_OPENAI",
        ollama: "OLLAMA",
        custom: "CUSTOM"
    };
    return map[provider];
}
function toWebProvider(provider) {
    const map = {
        NATIVE: "native",
        OPENAI: "openai",
        ANTHROPIC: "anthropic",
        GEMINI: "gemini",
        AZURE_OPENAI: "azure-openai",
        OLLAMA: "ollama",
        CUSTOM: "custom"
    };
    return map[provider];
}
function maskSecret(secret) {
    return `configured:${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
function apiKeyFor(provider) {
    const envByProvider = {
        OPENAI: "OPENAI_API_KEY",
        ANTHROPIC: "ANTHROPIC_API_KEY",
        GEMINI: "GEMINI_API_KEY",
        AZURE_OPENAI: "AZURE_OPENAI_API_KEY",
        CUSTOM: "CUSTOM_AI_API_KEY"
    };
    const envName = envByProvider[provider];
    return envName ? process.env[envName] : undefined;
}
function defaultModelFor(provider) {
    const modelByProvider = {
        NATIVE: "closira-baseline",
        OPENAI: "gpt-4o-mini",
        ANTHROPIC: "claude-3-5-sonnet-latest",
        GEMINI: "gemini-1.5-pro",
        AZURE_OPENAI: "gpt-4o-mini",
        OLLAMA: "llama3.1",
        CUSTOM: "gpt-4o-mini"
    };
    return modelByProvider[provider];
}
function defaultVisionModelFor(provider) {
    const modelByProvider = {
        NATIVE: "closira-baseline",
        OPENAI: "gpt-4o-mini",
        ANTHROPIC: "claude-3-5-sonnet-latest",
        GEMINI: "gemini-1.5-pro",
        AZURE_OPENAI: "gpt-4o-mini",
        OLLAMA: "llava",
        CUSTOM: "gpt-4o-mini"
    };
    return modelByProvider[provider];
}
function defaultBaseUrlFor(provider) {
    const urlByProvider = {
        NATIVE: aiServiceUrl(),
        OPENAI: "https://api.openai.com/v1",
        ANTHROPIC: "https://api.anthropic.com",
        GEMINI: "https://generativelanguage.googleapis.com",
        AZURE_OPENAI: process.env.AZURE_OPENAI_CHAT_COMPLETIONS_URL ?? "",
        OLLAMA: "http://localhost:11434",
        CUSTOM: process.env.CUSTOM_AI_BASE_URL ?? "https://api.openai.com/v1"
    };
    return urlByProvider[provider];
}
function choiceText(payload) {
    const choices = payload.choices;
    if (!Array.isArray(choices))
        return "{}";
    const first = choices[0];
    return first?.message?.content ?? "{}";
}
function anthropicText(payload) {
    const content = payload.content;
    if (!Array.isArray(content))
        return "{}";
    const first = content[0];
    return first?.text ?? "{}";
}
function geminiText(payload) {
    const candidates = payload.candidates;
    if (!Array.isArray(candidates))
        return "{}";
    const first = candidates[0];
    return first?.content?.parts?.[0]?.text ?? "{}";
}
function parseAiJson(text) {
    const stripped = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    try {
        return JSON.parse(stripped);
    }
    catch {
        return { explanation: text, confidence: 0.62 };
    }
}
function stylistPrompt(prompt, occasion, wardrobeItems) {
    return JSON.stringify({
        instruction: "You are Closira AI stylist. Return only JSON with title, occasion, explanation, confidence. Style only from owned wardrobe items.",
        userPrompt: prompt,
        occasion,
        wardrobeItems
    });
}
function shoppingPrompt(itemName, occasion, wardrobeItems) {
    return JSON.stringify({
        instruction: "You are Closira shopping assistant. Return only JSON with recommendation, compatibilityScore, duplicateRisk, explanation. recommendation must be buy, skip, or consider.",
        itemName,
        occasion,
        wardrobeItems
    });
}
function clothingAnalysisPrompt(item) {
    return JSON.stringify({
        instruction: "You are Closira clothing image analyst. Analyze the wardrobe item image and return only JSON with detected_category, detected_colors, suggested_tags, material, pattern, style_notes, confidence. suggested_tags must be short lowercase wardrobe tags. Do not invent personal traits or sensitive attributes.",
        item: {
            name: item.name,
            color: item.color,
            material: item.material,
            pattern: item.pattern,
            brand: item.brand,
            notes: item.notes
        }
    });
}
function normalizeEmbedding(source) {
    const values = source.length ? source : [0];
    return Array.from({ length: 768 }, (_, index) => values[index % values.length] ?? 0);
}
function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
function inferOccasion(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes("wedding"))
        return "Wedding";
    if (lower.includes("office") || lower.includes("presentation"))
        return "Office";
    if (lower.includes("travel"))
        return "Travel";
    if (lower.includes("capsule") || lower.includes("minimal"))
        return "Minimalist Capsule";
    return "Dinner";
}
function inferTitle(prompt) {
    const occasion = inferOccasion(prompt);
    if (occasion === "Wedding")
        return "Rose and gold wardrobe wedding look";
    if (occasion === "Office")
        return "Clean confident office outfit";
    if (occasion === "Travel")
        return "Comfortable polished travel outfit";
    if (occasion === "Minimalist Capsule")
        return "Minimal neutral capsule outfit";
    return "Polished dinner outfit from your wardrobe";
}
function normalizeRecommendation(payload) {
    return {
        title: typeof payload.title === "string" ? payload.title : "Native wardrobe recommendation",
        occasion: typeof payload.occasion === "string" ? payload.occasion : "Daily",
        items: Array.isArray(payload.items) ? payload.items : [],
        confidence: typeof payload.confidence === "number" ? payload.confidence : 0.5,
        explanation: typeof payload.explanation === "string" ? payload.explanation : "AI recommendation generated from wardrobe metadata.",
        fallback_used: Boolean(payload.fallback_used)
    };
}
function normalizeShopping(payload) {
    const recommendation = payload.recommendation === "buy" || payload.recommendation === "skip" || payload.recommendation === "consider" ? payload.recommendation : "consider";
    const duplicateRisk = payload.duplicate_risk === "low" || payload.duplicate_risk === "medium" || payload.duplicate_risk === "high" ? payload.duplicate_risk : "medium";
    return {
        recommendation,
        compatibility_score: typeof payload.compatibility_score === "number" ? payload.compatibility_score : 50,
        duplicate_risk: duplicateRisk,
        similar_items: Array.isArray(payload.similar_items) ? payload.similar_items : [],
        explanation: typeof payload.explanation === "string" ? payload.explanation : "AI shopping check generated from wardrobe metadata.",
        fallback_used: Boolean(payload.fallback_used)
    };
}
function normalizeClothingAnalysis(payload) {
    const colors = Array.isArray(payload.detected_colors) ? payload.detected_colors.filter((color) => typeof color === "string") : [];
    const tags = Array.isArray(payload.suggested_tags) ? payload.suggested_tags.filter((tag) => typeof tag === "string") : [];
    return {
        detected_category: typeof payload.detected_category === "string" ? payload.detected_category : "Wardrobe",
        detected_colors: colors.length ? colors : ["unknown"],
        suggested_tags: tags,
        material: typeof payload.material === "string" ? payload.material : undefined,
        pattern: typeof payload.pattern === "string" ? payload.pattern : undefined,
        style_notes: typeof payload.style_notes === "string" ? payload.style_notes : undefined,
        confidence: typeof payload.confidence === "number" ? payload.confidence : 0.5,
        fallback_used: Boolean(payload.fallback_used),
        model: typeof payload.model === "string" ? payload.model : undefined
    };
}
//# sourceMappingURL=ai.controller.js.map