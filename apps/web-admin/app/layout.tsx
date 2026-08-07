import type { Metadata } from "next";
import type React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Closira | AI wardrobe and styling assistant",
  description: "Organize your wardrobe, plan outfits, avoid duplicate shopping, and get AI-powered styling suggestions."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
