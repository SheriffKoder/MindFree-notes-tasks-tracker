/**
 * @file views/app-shell/index.tsx
 * Minimal protected app shell that renders route content with the shared app navigation.
 */

import type { ReactNode } from "react";

import { AppDesktopNav } from "@/views/app-shell/components/app-desktop-nav";
import { AppMobileNav } from "@/views/app-shell/components/app-mobile-nav";

/**
 * Props for the protected app shell.
 */
export interface AppShellProps {
  /** Main route content rendered inside the protected shell. */
  children: ReactNode;
}

/**
 * Renders the minimal shell used by protected MindFree routes.
 *
 * @param props - shell content
 * @returns Protected app shell with only route content and app navigation
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-row md:pl-24">

      <div className="w-fit hidden md:block absolute top-0 left-0 h-full z-50 p-3">
        <AppDesktopNav />
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-6 md:px-6 md:py-6">
        {children}
      </main>

      <div className="md:hidden">
        <AppMobileNav />
      </div>
    </div>
  );
}
