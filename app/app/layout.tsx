import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptPic Hub — AI Prompts & Images",
  description: "Discover AI images, copy prompts, and share your creative work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
