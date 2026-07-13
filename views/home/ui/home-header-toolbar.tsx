/**
 * @file views/home/ui/home-header-toolbar.tsx
 * Header actions for the Home page — theme, mobile aside, logout.
 */

"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/features/auth/logout";
import { HomeAsideDrawerTrigger } from "@/views/home/ui/home-aside-drawer-trigger";

/**
 * Compact toolbar beside the Home page title.
 */
export function HomeHeaderToolbar() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <ThemeSwitcher />
      <HomeAsideDrawerTrigger />
      <LogoutButton />
    </div>
  );
}
