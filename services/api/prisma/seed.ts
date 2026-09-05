import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@clorisa.com" },
    update: {},
    create: {
      email: "demo@clorisa.com",
      passwordHash: hash("ClorisaDemo123!"),
      name: "Clorisa Demo",
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          timezone: "Asia/Kolkata",
          country: "India",
          city: "Mumbai",
          styleWords: ["minimal", "polished", "warm neutrals"],
          sizes: { top: "M", bottom: "30", shoe: "8" },
          preferences: { avoid: ["itchy wool"], favoriteColors: ["ivory", "rose", "charcoal"] }
        }
      }
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@clorisa.com" },
    update: {},
    create: {
      email: "admin@clorisa.com",
      passwordHash: hash("ClorisaAdmin123!"),
      name: "Clorisa Admin",
      role: "ADMIN",
      emailVerifiedAt: new Date()
    }
  });

  const categoryInputs = [
    ["tops", "Tops", "#2563eb"],
    ["bottoms", "Bottoms", "#16a34a"],
    ["outerwear", "Outerwear", "#7c3aed"],
    ["shoes", "Shoes", "#dc2626"],
    ["accessories", "Accessories", "#ca8a04"]
  ] as const;

  const categories = new Map<string, string>();
  for (const [slug, name, color] of categoryInputs) {
    const category = await prisma.category.upsert({
      where: { userId_slug: { userId: user.id, slug } },
      update: { name, color },
      create: { userId: user.id, slug, name, color }
    });
    categories.set(slug, category.id);
  }

  const tagInputs = [
    ["office", "Office", "#334155"],
    ["dinner", "Dinner", "#be123c"],
    ["travel", "Travel", "#0f766e"],
    ["wedding", "Wedding", "#d97706"],
    ["capsule", "Capsule", "#525252"]
  ] as const;

  const tags = new Map<string, string>();
  for (const [slug, name, color] of tagInputs) {
    const tag = await prisma.tag.upsert({
      where: { userId_slug: { userId: user.id, slug } },
      update: { name, color },
      create: { userId: user.id, slug, name, color }
    });
    tags.set(slug, tag.id);
  }

  await prisma.auditLog.deleteMany({ where: { actorId: admin.id, action: "seed.created" } });
  await prisma.billingGateway.deleteMany({ where: { ownerId: null } });
  await prisma.invoice.deleteMany({ where: { subscription: { userId: user.id } } });
  await prisma.subscription.deleteMany({ where: { userId: user.id } });
  await prisma.aiJob.deleteMany({ where: { userId: user.id } });
  await prisma.calendarPlan.deleteMany({ where: { userId: user.id } });
  await prisma.outfit.deleteMany({ where: { userId: user.id } });
  await prisma.wardrobeUsageLog.deleteMany({ where: { userId: user.id } });
  await prisma.wardrobeItem.deleteMany({ where: { userId: user.id } });

  const itemInputs = [
    {
      name: "Ivory silk blouse",
      category: "tops",
      brand: "Aday",
      color: "Ivory",
      season: ["spring", "summer", "fall"],
      occasions: ["office", "dinner"],
      tags: ["office", "capsule"],
      slot: "TOP"
    },
    {
      name: "Charcoal tailored trouser",
      category: "bottoms",
      brand: "Theory",
      color: "Charcoal",
      season: ["all-season"],
      occasions: ["office", "travel"],
      tags: ["office", "capsule"],
      slot: "BOTTOM"
    },
    {
      name: "Rose satin midi dress",
      category: "tops",
      brand: "Reformation",
      color: "Rose",
      season: ["spring", "summer"],
      occasions: ["wedding", "dinner"],
      tags: ["wedding", "dinner"],
      slot: "DRESS"
    },
    {
      name: "Gold block heels",
      category: "shoes",
      brand: "Sam Edelman",
      color: "Gold",
      season: ["all-season"],
      occasions: ["wedding", "dinner"],
      tags: ["wedding", "dinner"],
      slot: "SHOES"
    },
    {
      name: "Soft trench coat",
      category: "outerwear",
      brand: "COS",
      color: "Stone",
      season: ["spring", "fall"],
      occasions: ["travel", "office"],
      tags: ["travel", "capsule"],
      slot: "OUTERWEAR"
    }
  ] as const;

  const itemIds: string[] = [];
  for (const input of itemInputs) {
    const item = await prisma.wardrobeItem.create({
      data: {
        userId: user.id,
        categoryId: categories.get(input.category),
        name: input.name,
        brand: input.brand,
        color: input.color,
        season: [...input.season],
        occasions: [...input.occasions],
        isFavorite: input.name.includes("Ivory") || input.name.includes("Gold"),
        images: {
          create: {
            storageKey: `seed/${input.name.toLowerCase().replaceAll(" ", "-")}.jpg`,
            provider: "LOCAL",
            url: `/uploads/seed/${input.name.toLowerCase().replaceAll(" ", "-")}.jpg`,
            contentType: "image/jpeg",
            byteSize: 128000,
            altText: input.name,
            isPrimary: true,
            analysis: { category: input.category, dominantColor: input.color, confidence: 0.86 }
          }
        },
        tags: {
          create: input.tags.map((slug) => ({ tagId: tags.get(slug)! }))
        }
      }
    });
    itemIds.push(item.id);
  }

  const outfit = await prisma.outfit.create({
    data: {
      userId: user.id,
      name: "Confident presentation outfit",
      description: "Clean ivory blouse, charcoal tailoring, and polished gold shoes.",
      occasion: "office",
      season: ["all-season"],
      source: "seed",
      items: {
        create: itemIds.slice(0, 2).map((itemId, index) => ({
          itemId,
          slot: index === 0 ? "TOP" : "BOTTOM",
          sortOrder: index
        }))
      }
    }
  });

  await prisma.calendarPlan.create({
    data: {
      userId: user.id,
      outfitId: outfit.id,
      startsAt: new Date("2026-09-02T10:00:00.000Z"),
      endsAt: new Date("2026-09-02T11:00:00.000Z"),
      title: "Investor presentation",
      location: "Mumbai",
      status: "PLANNED"
    }
  });

  await prisma.wardrobeUsageLog.create({
    data: {
      userId: user.id,
      itemId: itemIds[0],
      wornAt: new Date("2026-08-20T09:00:00.000Z"),
      context: "office"
    }
  });

  await prisma.aiProviderSetting.upsert({
    where: { userId_provider: { userId: user.id, provider: "NATIVE" } },
    update: {},
    create: {
      userId: user.id,
      provider: "NATIVE",
      displayName: "Clorisa Native AI",
      isEnabled: true,
      isDefault: true,
      model: "clorisa-baseline"
    }
  });

  await prisma.billingGateway.createMany({
    data: [
      { key: "manual", displayName: "Manual / dev billing", status: "ENABLED", config: { mode: "local" } },
      { key: "stripe", displayName: "Stripe", status: "TESTING", secretRef: "STRIPE_SECRET_KEY", webhookSecretRef: "STRIPE_WEBHOOK_SECRET" },
      { key: "razorpay", displayName: "Razorpay", status: "TESTING", secretRef: "RAZORPAY_KEY_SECRET", webhookSecretRef: "RAZORPAY_WEBHOOK_SECRET" },
      { key: "custom", displayName: "Custom gateway", status: "TESTING", secretRef: "CUSTOM_BILLING_SECRET", webhookSecretRef: "CUSTOM_BILLING_WEBHOOK_SECRET" }
    ]
  });

  await prisma.aiJob.create({
    data: {
      userId: user.id,
      provider: "NATIVE",
      type: "OUTFIT_RECOMMENDATION",
      status: "SUCCEEDED",
      input: { prompt: "Style me for an office presentation." },
      output: { title: outfit.name },
      confidence: "0.8200",
      startedAt: new Date(),
      finishedAt: new Date()
    }
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      providerKey: "manual",
      plan: "PRO",
      status: "ACTIVE",
      entitlements: { wardrobeItems: 500, aiRequestsPerMonth: 1000 }
    }
  });

  await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      providerKey: "manual",
      amountDue: "1999.00",
      currency: "INR",
      status: "paid",
      issuedAt: new Date(),
      paidAt: new Date()
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "seed.created",
      entity: "workspace",
      entityId: user.id,
      metadata: { source: "prisma seed" }
    }
  });

  console.log("Seeded Clorisa production baseline data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
