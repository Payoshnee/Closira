import { mockSession } from "@/lib/mock/auth";
import type { AuthFormState, AuthIntent, AuthSession } from "@/types/auth";

export type { AuthIntent } from "@/types/auth";

export async function getCurrentSession(): Promise<AuthSession> {
  // TODO: Replace mock session with GET /auth/session or token introspection when auth persistence lands.
  return mockSession;
}

export async function submitAuthIntent(intent: AuthIntent): Promise<AuthFormState> {
  // TODO: Replace with POST /auth/login, /auth/register, and /auth/forgot-password when the NestJS endpoints are implemented.
  const messages = {
    login: "Auth API is deferred; continuing into the local dashboard shell.",
    signup: "Signup API is deferred; continuing into the local dashboard shell.",
    "forgot-password": "Password reset API is deferred; returning to login."
  };

  return { status: "deferred", message: messages[intent] };
}
