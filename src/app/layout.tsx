import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  title: "N-SHIELD — AI-Driven Urban Safety Intelligence Model",
  description:
    "AI-powered urban safety intelligence model for Nagpur, Maharashtra. Real-time crime-risk visualization, predictive policing, verified emergency services, incident news, and 24/7 citizen safety companion.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body
        suppressHydrationWarning
        className="h-full antialiased bg-white dark:bg-zinc-950 font-sans selection:bg-emerald-500 selection:text-white"
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
