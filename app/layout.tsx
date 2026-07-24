/**
 * @file app/layout.tsx
 * Root layout — fonts, theme provider, and pre-paint theme boot script.
 */

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { ThemeBootScriptTag } from "@/features/profile/apply-theme/ui/theme-boot-script-tag";
import { AuthSessionSync } from "@/features/auth/session-expiry";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MindFree",
  description:
    "A mobile-first productivity app for notes, tasks, reminders, and progress tracking.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeBootScriptTag />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="theme"
        >
          <AuthSessionSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
