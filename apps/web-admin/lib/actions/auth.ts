"use server";

import { resetPassword, verifyEmail } from "@/lib/api/auth";
import type { AuthFormState } from "@/types/auth";

export async function submitResetPassword(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const token = stringValue(formData.get("token"));
  const password = stringValue(formData.get("password"));
  if (!token || !password) {
    return { status: "error", message: "Token and password are required." };
  }
  return resetPassword(token, password);
}

export async function submitVerifyEmail(token: string): Promise<AuthFormState> {
  if (!token) {
    return { status: "error", message: "Verification token is missing." };
  }
  return verifyEmail(token);
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
