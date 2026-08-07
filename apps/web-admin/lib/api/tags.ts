import { mockTags } from "@/lib/mock/wardrobe";
import type { Tag, TagType } from "@/types/wardrobe";

export async function listTags(type?: TagType): Promise<Tag[]> {
  // TODO: Replace mock adapter with GET /tags once the NestJS endpoint is implemented.
  return type ? mockTags.filter((tag) => tag.type === type) : mockTags;
}
