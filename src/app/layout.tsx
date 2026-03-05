import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContentForge AI - Transform Content into Viral Posts",
  description: "AI-powered content transformation tool. Paste your content and automatically generate platform-optimized posts for Twitter, LinkedIn, Instagram, and more.",
  keywords: ["ContentForge", "AI", "content generation", "social media", "Twitter", "LinkedIn", "Instagram", "viral content"],
  authors: [{ name: "ContentForge AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "ContentForge AI",
    description: "Transform one piece of content into multiple viral social media posts",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentForge AI",
    description: "Transform one piece of content into multiple viral social media posts",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
