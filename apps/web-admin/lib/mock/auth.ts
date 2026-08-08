import type { AuthSession } from "@/types/auth";

export const mockSession: AuthSession = {
  isAuthenticated: true,
  user: {
    id: "user-demo",
    name: "Closira Founder",
    email: "founder@closira.local",
    role: "admin",
    wardrobeItemCount: 5
  }
};

