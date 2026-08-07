export type AuthIntent = "login" | "signup" | "forgot-password";

export async function submitAuthIntent(intent: AuthIntent): Promise<{ status: "deferred"; intent: AuthIntent }> {
  // TODO(Run 2): replace with real auth endpoints when dashboard authentication is implemented.
  return { status: "deferred", intent };
}

