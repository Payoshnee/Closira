export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  emailVerified?: boolean;
  wardrobeItemCount: number;
};

export type AuthSession = {
  user: AuthUser;
  isAuthenticated: boolean;
};

export type AuthIntent = "login" | "signup" | "forgot-password";

export type AuthFormState = {
  status: "ready" | "success" | "error";
  message: string;
};
