"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiPatch, apiPost } from "@/lib/api/client";
import type { Outfit } from "@/types/outfits";
import type { OutfitCalendarEvent } from "@/types/calendar";

type ActionState = {
  status: "ready" | "error";
  message: string;
};

export async function saveOutfit(outfitId: string | undefined, _state: ActionState, formData: FormData): Promise<ActionState> {
  const itemIds = ["item-0", "item-1", "item-2"].map((key) => value(formData, key)).filter(Boolean) as string[];
  const payload = {
    name: value(formData, "name"),
    occasion: value(formData, "occasion"),
    notes: value(formData, "notes"),
    itemIds
  };
  const result = outfitId ? await apiPatch<Outfit>(`/outfits/${outfitId}`, payload) : await apiPost<Outfit>("/outfits", payload);

  if (result.error || !result.data) {
    return { status: "error", message: result.error ?? "Outfit was not returned by the API." };
  }

  revalidateOutfits();
  redirect(`/dashboard/outfits/${result.data.id}`);
}

export async function duplicateOutfit(outfitId: string) {
  const result = await apiPost<Outfit>(`/outfits/${outfitId}/duplicate`, {});
  revalidateOutfits();
  if (result.data) redirect(`/dashboard/outfits/${result.data.id}`);
}

export async function toggleOutfitFavorite(outfitId: string, isFavorite: boolean) {
  await apiPatch(`/outfits/${outfitId}/favorite`, { isFavorite: !isFavorite });
  revalidateOutfits(outfitId);
}

export async function planCalendarOutfit(_state: ActionState, formData: FormData): Promise<ActionState> {
  const payload = {
    outfitId: value(formData, "outfitId"),
    eventName: value(formData, "eventName"),
    eventType: value(formData, "eventType"),
    startsAt: value(formData, "startsAt"),
    location: value(formData, "location"),
    notes: value(formData, "notes")
  };
  const result = await apiPost<OutfitCalendarEvent>("/calendar/outfits", payload);

  if (result.error || !result.data) {
    return { status: "error", message: result.error ?? "Calendar event was not returned by the API." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/outfits");
  redirect("/dashboard/calendar");
}

export async function markCalendarOutfitWorn(eventId: string) {
  await apiPatch(`/calendar/outfits/${eventId}/worn`, {});
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/outfits");
  revalidatePath("/dashboard/wardrobe");
}

function revalidateOutfits(outfitId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/outfits");
  revalidatePath("/dashboard/calendar");
  if (outfitId) {
    revalidatePath(`/dashboard/outfits/${outfitId}`);
    revalidatePath(`/dashboard/outfits/${outfitId}/edit`);
  }
}

function value(formData: FormData, key: string) {
  const current = formData.get(key);
  return typeof current === "string" && current.trim() ? current.trim() : undefined;
}
