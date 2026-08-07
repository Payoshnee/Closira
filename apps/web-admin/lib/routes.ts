export const routes = {
  home: "/",
  features: "/features",
  howItWorks: "/how-it-works",
  pricing: "/pricing",
  aiStylist: "/ai-stylist",
  smartShopping: "/smart-shopping",
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password"
} as const;

export const publicNavItems = [
  { href: routes.features, label: "Features" },
  { href: routes.howItWorks, label: "How it works" },
  { href: routes.aiStylist, label: "AI stylist" },
  { href: routes.pricing, label: "Pricing" }
];
