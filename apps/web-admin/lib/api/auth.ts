"use server";

import { cookies } from "next/headers";
import type { AuthFormState, AuthIntent, AuthSession, AuthUser } from "@/types/auth";

export type { AuthIntent } from "@/types/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

type AuthResponse = {
  user: AuthUser;
};

export async function getCurrentSession(): Promise<AuthSession> {
  const cookieHeader = await getCookieHeader();
  const result = await fetch(`${apiUrl}/auth/me`, {
    headers: { Accept: "application/json", Cookie: cookieHeader },
    cache: "no-store"
  });

  if (!result.ok) {
    return { user: emptyUser(), isAuthenticated: false };
  }

  const payload = (await result.json()) as AuthResponse;
  return { user: payload.user, isAuthenticated: true };
}

export async function submitAuthIntent(intent: AuthIntent, formData: FormData): Promise<AuthFormState> {
  const payload = Object.fromEntries(formData.entries());
  const path =
    intent === "login" ? "/auth/login" : intent === "signup" ? "/auth/register" : "/auth/forgot-password";

  const result = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const responseBody = await safeJson<{ message?: string; devResetToken?: string }>(result);

  if (!result.ok) {
    return {
      status: "error",
      message: responseBody.message ?? `Request failed with status ${result.status}`
    };
  }

  await persistSetCookie(result.headers);

  if (intent === "forgot-password") {
    return {
      status: "success",
      message: responseBody.devResetToken
        ? `Reset token generated for local development: ${responseBody.devResetToken}`
        : "If that email exists, a reset link has been prepared."
    };
  }

  return { status: "success", message: "Authenticated successfully." };
}

export async function logout(): Promise<void> {
  const cookieHeader = await getCookieHeader();
  const csrfToken = await getCsrfToken();
  const result = await fetch(`${apiUrl}/auth/logout`, {
    method: "POST",
    headers: { Accept: "application/json", Cookie: cookieHeader, ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}) },
    cache: "no-store"
  });

  await persistSetCookie(result.headers);
}

export async function resetPassword(token: string, password: string): Promise<AuthFormState> {
  const result = await fetch(`${apiUrl}/auth/reset-password`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
    cache: "no-store"
  });
  const responseBody = await safeJson<{ message?: string }>(result);

  if (!result.ok) {
    return { status: "error", message: responseBody.message ?? `Request failed with status ${result.status}` };
  }

  return { status: "success", message: "Password reset. You can log in now." };
}

export async function verifyEmail(token: string): Promise<AuthFormState> {
  const result = await fetch(`${apiUrl}/auth/verify-email`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    cache: "no-store"
  });
  const responseBody = await safeJson<{ message?: string }>(result);

  if (!result.ok) {
    return { status: "error", message: responseBody.message ?? `Request failed with status ${result.status}` };
  }

  return { status: "success", message: "Email verified." };
}

async function getCookieHeader() {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

async function getCsrfToken() {
  const cookieStore = await cookies();
  return cookieStore.get("clorisa_csrf")?.value;
}

async function persistSetCookie(headers: Headers) {
  const cookieStore = await cookies();
  const setCookies = getSetCookies(headers);

  for (const header of setCookies) {
    const [pair] = header.split(";");
    const index = pair.indexOf("=");
    if (index === -1) {
      continue;
    }

    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    const httpOnly = header.toLowerCase().includes("httponly");
    cookieStore.set(name, value, {
      httpOnly,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
  }
}

function getSetCookies(headers: Headers) {
  const withGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof withGetSetCookie.getSetCookie === "function") {
    return withGetSetCookie.getSetCookie();
  }

  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

async function safeJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

function emptyUser(): AuthUser {
  return {
    id: "",
    name: "",
    email: "",
    role: "user",
    wardrobeItemCount: 0
  };
}
