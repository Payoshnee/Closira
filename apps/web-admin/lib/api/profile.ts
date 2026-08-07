export type ProfileStatus = { available: false; reason: string };
export async function getProfileStatus(): Promise<ProfileStatus> {
  return { available: false, reason: "Profile API is scheduled for Run 6." };
}

