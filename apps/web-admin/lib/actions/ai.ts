"use server";

import { revalidatePath } from "next/cache";
import { updateAiProviderSettings } from "@/lib/api/aiStylist";
import type { AiProvider } from "@/types/ai";

export async function saveAiProviderSettings(formData: FormData) {
  const provider = formData.get("provider");
  if (typeof provider !== "string") return;

  await updateAiProviderSettings({
    provider: provider as AiProvider,
    activeProvider: provider as AiProvider,
    apiKey: value(formData, "apiKey"),
    baseUrl: value(formData, "baseUrl"),
    model: value(formData, "model")
  });

  revalidatePath("/dashboard/ai-settings");
  revalidatePath("/dashboard/ai-stylist");
  revalidatePath("/dashboard/shopping-assistant");
}

function value(formData: FormData, key: string) {
  const current = formData.get(key);
  return typeof current === "string" && current.trim() ? current.trim() : undefined;
}
