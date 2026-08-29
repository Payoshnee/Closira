"use server";

import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/api/profile";

type ProfileState = {
  status: "ready" | "success" | "error";
  message: string;
};

export async function saveProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const profile = await updateProfile({
    name: value(formData, "name"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    privacyMode: value(formData, "privacyMode") as "standard" | "strict" | undefined,
    notificationsEnabled: formData.get("notificationsEnabled") === "on",
    stylePreferences: splitList(value(formData, "stylePreferences")),
    favoriteColors: splitList(value(formData, "favoriteColors"))
  });

  if (!profile) {
    return { status: "error", message: "Profile could not be saved." };
  }

  revalidatePath("/dashboard/profile");
  return { status: "success", message: "Profile saved." };
}

function value(formData: FormData, key: string) {
  const current = formData.get(key);
  return typeof current === "string" && current.trim() ? current.trim() : undefined;
}

function splitList(value?: string) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}
