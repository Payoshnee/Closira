import { apiGet } from "@/lib/api/client";
import { mockTags } from "@/lib/mock/wardrobe";
import type { Tag, TagType } from "@/types/wardrobe";

export async function listTags(type?: TagType): Promise<Tag[]> {
  const result = await apiGet<Tag[]>("/tags");
  const tags = result.data ?? mockTags;
  return type ? tags.filter((tag) => tag.type === type) : tags;
}
