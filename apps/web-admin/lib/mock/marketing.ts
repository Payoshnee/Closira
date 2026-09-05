import {
  BarChart3,
  CalendarDays,
  Camera,
  GalleryVerticalEnd,
  SearchCheck,
  Shirt,
  Sparkles
} from "lucide-react";
import type { MarketingFeature, MarketingStep, PricingPlan } from "@/types/marketing";

export const featureHighlights: MarketingFeature[] = [
  { title: "Digital wardrobe", description: "Keep clothing photos, categories, colors, seasons, and usage details in one calm library.", icon: Shirt },
  { title: "Outfit builder", description: "Create looks from what you already own and save combinations for repeat moments.", icon: GalleryVerticalEnd },
  { title: "Outfit calendar", description: "Plan looks for travel, work, weddings, festivals, and everyday routines.", icon: CalendarDays },
  { title: "AI stylist", description: "Ask for outfit ideas grounded in your real wardrobe, not generic shopping feeds.", icon: Sparkles },
  { title: "Smart shopping assistant", description: "Check whether a new item duplicates what you own or completes useful outfits.", icon: SearchCheck },
  { title: "Wardrobe analytics", description: "Understand unused clothes, repeat wears, wardrobe value, and cost per wear.", icon: BarChart3 },
  { title: "Future virtual try-on", description: "Preview fashion and beauty ideas only with explicit consent and clear controls.", icon: Camera }
];

export const howItWorksSteps: MarketingStep[] = [
  { title: "Add clothes", description: "Capture front, back, and detail photos with the context that makes an item searchable." },
  { title: "Organize them", description: "Use categories, tags, colors, materials, seasons, occasions, and favorites." },
  { title: "Create outfits", description: "Combine pieces into reusable looks and keep your best formulas close." },
  { title: "Ask AI stylist", description: "Get suggestions based on your wardrobe, your plans, and your preferences." },
  { title: "Plan on calendar", description: "Map outfits to events so getting ready feels lighter." },
  { title: "Check before buying", description: "Compare wishlist pieces against what you own before spending." }
];

export const benefits = [
  "Save time getting dressed",
  "Save money by avoiding duplicates",
  "Reuse clothes more intentionally",
  "Plan events with less stress",
  "Feel organized every day",
  "Keep wardrobe data private by default"
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Early access",
    price: "$0",
    description: "For founding users helping shape Clorisa.",
    features: ["Digital wardrobe foundation", "Outfit planning preview", "AI styling waitlist", "Privacy-first account controls"],
    cta: "Join early access"
  },
  {
    name: "Clorisa Plus",
    price: "Coming soon",
    description: "For wardrobe analytics, AI styling, and shopping decisions.",
    features: ["Advanced AI stylist", "Smart shopping checks", "Wardrobe analytics", "Priority feature access"],
    cta: "Get notified"
  }
];
