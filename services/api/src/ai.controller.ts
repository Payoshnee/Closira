import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { AiJobType, AiProviderType, Prisma } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { requireCurrentUser } from "./auth/current-user";
import { PrismaService } from "./prisma.service";
import { itemInclude, toWardrobeItem } from "./wardrobe.mapper";

type WebProvider = "native" | "openai" | "anthropic" | "gemini" | "azure-openai" | "ollama" | "custom";

type AiProviderSettings = {
  activeProvider: WebProvider;
  nativeEnabled: boolean;
  connectedProviders: WebProvider[];
  supportedProviders: { id: WebProvider; name: string; requiresApiKey: boolean; endpointLabel?: string }[];
};

const supportedProviders: AiProviderSettings["supportedProviders"] = [
  { id: "native", name: "Closira Native AI", requiresApiKey: false },
  { id: "openai", name: "ChatGPT / OpenAI", requiresApiKey: true },
  { id: "anthropic", name: "Claude / Anthropic", requiresApiKey: true },
  { id: "gemini", name: "Gemini / Google", requiresApiKey: true },
  { id: "azure-openai", name: "Azure OpenAI", requiresApiKey: true, endpointLabel: "Azure endpoint" },
  { id: "ollama", name: "Ollama", requiresApiKey: false, endpointLabel: "Local Ollama URL" },
  { id: "custom", name: "Custom OpenAI-compatible API", requiresApiKey: true, endpointLabel: "Base URL" }
];

@Controller("ai")
export class AiController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  @Get("settings")
  async getSettings(@Req() request: Request): Promise<AiProviderSettings> {
    const user = requireCurrentUser(request, this.auth);
    const settings = await this.prisma.aiProviderSetting.findMany({ where: { userId: user.id } });
    const active = settings.find((setting) => setting.isDefault && setting.isEnabled) ?? settings.find((setting) => setting.isEnabled);
    return {
      activeProvider: toWebProvider(active?.provider ?? "NATIVE"),
      nativeEnabled: settings.some((setting) => setting.provider === "NATIVE" && setting.isEnabled) || settings.length === 0,
      connectedProviders: settings.filter((setting) => setting.isEnabled).map((setting) => toWebProvider(setting.provider)),
      supportedProviders
    };
  }

  @Post("settings")
  async updateSettings(
    @Req() request: Request,
    @Body() body: Partial<AiProviderSettings> & { provider?: WebProvider; apiKey?: string; baseUrl?: string; model?: string }
  ) {
    const user = requireCurrentUser(request, this.auth);
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

  @Post("recommend-outfit")
  async recommendOutfit(@Req() request: Request, @Body() body: { prompt?: string; occasion?: string }) {
    const user = requireCurrentUser(request, this.auth);
    const provider = await this.activeProvider(user.id);
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
    } catch (error) {
      const fallback = this.localStylistFallback(job.id, body, wardrobe, provider.provider);
      await this.finishJob(job.id, fallback, fallback.confidence, true, error);
      return fallback;
    }
  }

  @Get("recommendations")
  async listRecommendations(@Req() request: Request) {
    const prompts = [
      "Create a polished dinner outfit using items I have not worn recently.",
      "Style me for an office presentation with a clean, elegant, confident look.",
      "Suggest a wedding guest outfit with rose or gold tones from my wardrobe.",
      "Build a comfortable travel outfit that still looks put together.",
      "Give me a minimalist capsule outfit using neutral colors and reusable pieces."
    ];
    return Promise.all(prompts.map((prompt) => this.recommendOutfit(request, { prompt })));
  }

  @Post("shopping-check")
  async shoppingCheck(@Req() request: Request, @Body() body: { itemName?: string; occasion?: string }) {
    const user = requireCurrentUser(request, this.auth);
    const provider = await this.activeProvider(user.id);
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
    } catch (error) {
      const result = this.localShoppingFallback(job.id, body.itemName ?? "New item", wardrobe, provider.provider);
      await this.finishJob(job.id, result, result.compatibilityScore / 100, true, error);
      return result;
    }
  }

  @Get("shopping-checks")
  async listShoppingChecks(@Req() request: Request) {
    return Promise.all([
      this.shoppingCheck(request, { itemName: "Cream oversized blazer", occasion: "Office" }),
      this.shoppingCheck(request, { itemName: "Silver strappy heels", occasion: "Wedding" })
    ]);
  }

  @Post("items/:itemId/analyze")
  async analyzeItem(@Req() request: Request, @Param("itemId") itemId: string) {
    const user = requireCurrentUser(request, this.auth);
    const item = await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id: itemId, userId: user.id }, include: itemInclude });
    const job = await this.createJob(user.id, "NATIVE", "CLOTHING_ANALYSIS", { itemId });
    const analysis = await postJson(`${aiServiceUrl()}/analyze-clothing`, {
      item_name: item.name,
      notes: [item.color, item.material, item.pattern, item.brand].filter(Boolean).join(" ")
    });
    await this.prisma.wardrobeImage.updateMany({
      where: { itemId: item.id, isPrimary: true },
      data: { analysis: analysis as Prisma.InputJsonValue }
    });
    await this.applyAutoTags(user.id, item.id, analysis.suggested_tags);
    await this.finishJob(job.id, analysis, Number(analysis.confidence ?? 0), Boolean(analysis.fallback_used));
    return analysis;
  }

  @Post("items/:itemId/embed")
  async embedItem(@Req() request: Request, @Param("itemId") itemId: string) {
    const user = requireCurrentUser(request, this.auth);
    const item = await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id: itemId, userId: user.id }, include: { images: true } });
    const job = await this.createJob(user.id, "NATIVE", "IMAGE_EMBEDDING", { itemId });
    const result = await postJson(`${aiServiceUrl()}/embed-image`, { item_name: item.name, image_url: item.images[0]?.url });
    const vector = normalizeEmbedding(result.embedding as number[]);
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO image_embeddings (item_id, image_id, model, dimension, embedding) VALUES ($1::uuid, $2::uuid, $3, 768, $4::vector)`,
      item.id,
      item.images[0]?.id ?? null,
      result.model ?? "closira-native-embedding-v0",
      `[${vector.join(",")}]`
    );
    await this.finishJob(job.id, result, 0.8, Boolean(result.fallback_used));
    return { ...result, dimensions: 768 };
  }

  @Get("items/:itemId/similar")
  async similarItems(@Req() request: Request, @Param("itemId") itemId: string) {
    const user = requireCurrentUser(request, this.auth);
    await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id: itemId, userId: user.id } });
    const source = await this.prisma.$queryRaw<{ embedding: string }[]>`
      SELECT embedding::text AS embedding
      FROM image_embeddings
      WHERE item_id = ${itemId}::uuid
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (!source[0]) return [];

    const rows = await this.prisma.$queryRaw<{ item_id: string; distance: number }[]>`
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
      include: itemInclude
    });
    const byId = new Map(items.map((item) => [item.id, toWardrobeItem(item)]));
    return rows.map((row) => ({ item: byId.get(row.item_id), similarity: Number((1 - row.distance).toFixed(4)) })).filter((row) => row.item);
  }

  private async activeProvider(userId: string) {
    const setting =
      (await this.prisma.aiProviderSetting.findFirst({ where: { userId, isDefault: true, isEnabled: true } })) ??
      (await this.prisma.aiProviderSetting.upsert({
        where: { userId_provider: { userId, provider: "NATIVE" } },
        update: { isEnabled: true, isDefault: true },
        create: { userId, provider: "NATIVE", displayName: "Closira Native AI", isEnabled: true, isDefault: true, model: "closira-baseline" }
      }));
    return setting;
  }

  private async userWardrobe(userId: string) {
    const items = await this.prisma.wardrobeItem.findMany({ where: { userId, status: "ACTIVE" }, include: itemInclude, orderBy: { updatedAt: "desc" } });
    return items.map(toWardrobeItem);
  }

  private async callProviderRecommendation(provider: Awaited<ReturnType<AiController["activeProvider"]>>, body: { prompt?: string; occasion?: string }, wardrobeItems: unknown[]) {
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

  private async callProviderShopping(provider: Awaited<ReturnType<AiController["activeProvider"]>>, itemName: string, occasion: string | undefined, wardrobeItems: unknown[]) {
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

  private async callExternalTextProvider(provider: Awaited<ReturnType<AiController["activeProvider"]>>, prompt: string) {
    const config = provider.config as { apiKeyEnv?: string } | null;
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

  private async createJob(userId: string, provider: AiProviderType, type: AiJobType, input: Prisma.InputJsonValue) {
    return this.prisma.aiJob.create({ data: { userId, provider, type, status: "RUNNING", input, startedAt: new Date() } });
  }

  private async finishJob(id: string, output: unknown, confidence: number, fallbackUsed: boolean, error?: unknown) {
    await this.prisma.aiJob.update({
      where: { id },
      data: {
        status: error ? "FALLBACK_USED" : fallbackUsed ? "FALLBACK_USED" : "SUCCEEDED",
        output: output as Prisma.InputJsonValue,
        confidence,
        errorMessage: error instanceof Error ? error.message : undefined,
        finishedAt: new Date()
      }
    });
  }

  private async applyAutoTags(userId: string, itemId: string, suggestedTags: unknown) {
    if (!Array.isArray(suggestedTags)) return;

    for (const tagName of suggestedTags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim()))) {
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

  private localStylistFallback(id: string, body: { prompt?: string; occasion?: string }, wardrobe: ReturnType<typeof toWardrobeItem>[], provider: AiProviderType) {
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

  private localShoppingFallback(id: string, itemName: string, wardrobe: ReturnType<typeof toWardrobeItem>[], provider: AiProviderType) {
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
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`AI request failed with status ${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
}

async function postJsonWithHeaders(url: string, body: unknown, headers: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Provider request failed with status ${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
}

function aiServiceUrl() {
  return process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8000";
}

function toDbProvider(provider: WebProvider): AiProviderType {
  const map: Record<WebProvider, AiProviderType> = {
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

function toWebProvider(provider: AiProviderType): WebProvider {
  const map: Record<AiProviderType, WebProvider> = {
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

function maskSecret(secret: string) {
  return `configured:${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

function apiKeyFor(provider: AiProviderType) {
  const envByProvider: Partial<Record<AiProviderType, string>> = {
    OPENAI: "OPENAI_API_KEY",
    ANTHROPIC: "ANTHROPIC_API_KEY",
    GEMINI: "GEMINI_API_KEY",
    AZURE_OPENAI: "AZURE_OPENAI_API_KEY",
    CUSTOM: "CUSTOM_AI_API_KEY"
  };
  const envName = envByProvider[provider];
  return envName ? process.env[envName] : undefined;
}

function defaultModelFor(provider: AiProviderType) {
  const modelByProvider: Record<AiProviderType, string> = {
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

function defaultBaseUrlFor(provider: AiProviderType) {
  const urlByProvider: Record<AiProviderType, string> = {
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

function choiceText(payload: Record<string, unknown>) {
  const choices = payload.choices;
  if (!Array.isArray(choices)) return "{}";
  const first = choices[0] as { message?: { content?: string } } | undefined;
  return first?.message?.content ?? "{}";
}

function anthropicText(payload: Record<string, unknown>) {
  const content = payload.content;
  if (!Array.isArray(content)) return "{}";
  const first = content[0] as { text?: string } | undefined;
  return first?.text ?? "{}";
}

function geminiText(payload: Record<string, unknown>) {
  const candidates = payload.candidates;
  if (!Array.isArray(candidates)) return "{}";
  const first = candidates[0] as { content?: { parts?: { text?: string }[] } } | undefined;
  return first?.content?.parts?.[0]?.text ?? "{}";
}

function parseAiJson(text: string) {
  const stripped = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(stripped) as Record<string, unknown>;
  } catch {
    return { explanation: text, confidence: 0.62 };
  }
}

function stylistPrompt(prompt: string | undefined, occasion: string | undefined, wardrobeItems: unknown[]) {
  return JSON.stringify({
    instruction: "You are Closira AI stylist. Return only JSON with title, occasion, explanation, confidence. Style only from owned wardrobe items.",
    userPrompt: prompt,
    occasion,
    wardrobeItems
  });
}

function shoppingPrompt(itemName: string, occasion: string | undefined, wardrobeItems: unknown[]) {
  return JSON.stringify({
    instruction: "You are Closira shopping assistant. Return only JSON with recommendation, compatibilityScore, duplicateRisk, explanation. recommendation must be buy, skip, or consider.",
    itemName,
    occasion,
    wardrobeItems
  });
}

function normalizeEmbedding(source: number[]) {
  const values = source.length ? source : [0];
  return Array.from({ length: 768 }, (_, index) => values[index % values.length] ?? 0);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function inferOccasion(prompt: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes("wedding")) return "Wedding";
  if (lower.includes("office") || lower.includes("presentation")) return "Office";
  if (lower.includes("travel")) return "Travel";
  if (lower.includes("capsule") || lower.includes("minimal")) return "Minimalist Capsule";
  return "Dinner";
}

function inferTitle(prompt: string) {
  const occasion = inferOccasion(prompt);
  if (occasion === "Wedding") return "Rose and gold wardrobe wedding look";
  if (occasion === "Office") return "Clean confident office outfit";
  if (occasion === "Travel") return "Comfortable polished travel outfit";
  if (occasion === "Minimalist Capsule") return "Minimal neutral capsule outfit";
  return "Polished dinner outfit from your wardrobe";
}

function normalizeRecommendation(payload: Record<string, unknown>) {
  return {
    title: typeof payload.title === "string" ? payload.title : "Native wardrobe recommendation",
    occasion: typeof payload.occasion === "string" ? payload.occasion : "Daily",
    items: Array.isArray(payload.items) ? payload.items : [],
    confidence: typeof payload.confidence === "number" ? payload.confidence : 0.5,
    explanation: typeof payload.explanation === "string" ? payload.explanation : "AI recommendation generated from wardrobe metadata.",
    fallback_used: Boolean(payload.fallback_used)
  };
}

function normalizeShopping(payload: Record<string, unknown>) {
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
