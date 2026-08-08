import { mockProfile } from "@/lib/mock/profile";
import type { UserProfile } from "@/types/profile";

export async function getProfile(): Promise<UserProfile> {
  // TODO: Replace mock adapter with GET /profile once the NestJS endpoint is implemented.
  return mockProfile;
}
