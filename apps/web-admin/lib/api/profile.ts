import { apiGet, apiPatch } from "@/lib/api/client";
import { mockProfile } from "@/lib/mock/profile";
import type { UserProfile } from "@/types/profile";

export async function getProfile(): Promise<UserProfile> {
  const result = await apiGet<UserProfile>("/profile");
  return result.data ?? mockProfile;
}

export async function updateProfile(body: Partial<UserProfile>): Promise<UserProfile | null> {
  const result = await apiPatch<UserProfile, Partial<UserProfile>>("/profile", body);
  return result.data ?? null;
}
