"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiDelete, apiPatch, apiPost } from "@/lib/api/client";
import type { WardrobeItem } from "@/types/wardrobe";

type ActionState = {
  status: "ready" | "error";
  message: string;
};

export async function saveWardrobeItem(itemId: string | undefined, _state: ActionState, formData: FormData): Promise<ActionState> {
  const tagId = value(formData, "tagId");
  const payload = {
    title: value(formData, "title"),
    categoryId: value(formData, "categoryId"),
    primaryColor: value(formData, "primaryColor"),
    material: value(formData, "material"),
    brand: value(formData, "brand"),
    size: value(formData, "size"),
    notes: value(formData, "notes"),
    tagIds: tagId ? [tagId] : []
  };

  const result = itemId
    ? await apiPatch<WardrobeItem>(`/wardrobe/items/${itemId}`, payload)
    : await apiPost<WardrobeItem>("/wardrobe/items", payload);

  if (result.error) {
    return { status: "error", message: result.error };
  }

  if (!result.data) {
    return { status: "error", message: "Wardrobe item was not returned by the API." };
  }

  revalidateWardrobe();
  redirect(`/dashboard/wardrobe/${result.data.id}`);
}

export async function createTaxonomy(mode: "category" | "tag", _state: ActionState, formData: FormData): Promise<ActionState> {
  const name = value(formData, "name");
  const path = mode === "category" ? "/categories" : "/tags";
  const result = await apiPost(path, { name });

  if (result.error) {
    return { status: "error", message: result.error };
  }

  revalidatePath(mode === "category" ? "/dashboard/categories" : "/dashboard/tags");
  revalidatePath("/dashboard/wardrobe");
  return { status: "ready", message: `${mode === "category" ? "Category" : "Tag"} added.` };
}

export async function deleteTaxonomy(mode: "category" | "tag", id: string) {
  const path = mode === "category" ? `/categories/${id}` : `/tags/${id}`;
  await apiDelete(path);
  revalidatePath(mode === "category" ? "/dashboard/categories" : "/dashboard/tags");
  revalidatePath("/dashboard/wardrobe");
}

export async function toggleWardrobeFavorite(itemId: string, isFavorite: boolean) {
  await apiPatch(`/wardrobe/items/${itemId}/favorite`, { isFavorite: !isFavorite });
  revalidateWardrobe(itemId);
}

export async function markWardrobeItemWorn(itemId: string) {
  await apiPost(`/wardrobe/items/${itemId}/mark-worn`, { wornAt: new Date().toISOString(), context: "manual" });
  revalidateWardrobe(itemId);
}

export async function archiveWardrobeItem(itemId: string) {
  await apiPatch(`/wardrobe/items/${itemId}/archive`, {});
  revalidateWardrobe(itemId);
  redirect("/dashboard/wardrobe");
}

function value(formData: FormData, key: string) {
  const current = formData.get(key);
  return typeof current === "string" && current.trim() ? current.trim() : undefined;
}

function revalidateWardrobe(itemId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/wardrobe");
  if (itemId) {
    revalidatePath(`/dashboard/wardrobe/${itemId}`);
    revalidatePath(`/dashboard/wardrobe/${itemId}/edit`);
  }
}
