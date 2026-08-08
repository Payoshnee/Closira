export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  stylePreferences: string[];
  favoriteColors: string[];
  privacyMode: "standard" | "strict";
  notificationsEnabled: boolean;
};

