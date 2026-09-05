import type { AuthSession } from "@/types/auth";

export const mockSession: AuthSession = {
  isAuthenticated: true,
  user: {
    id: "user-demo",
    name: "Clorisa Founder",
    email: "founder@clorisa.local",
    role: "admin",
    wardrobeItemCount: 5
  }
};

