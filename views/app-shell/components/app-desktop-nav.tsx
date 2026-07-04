/**
 * @file views/app-shell/components/app-desktop-nav.tsx
 * Left desktop navigation rail for protected MindFree routes.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CheckSquare, FileText, Home } from "lucide-react";

import {
  APP_NAVIGATION_ITEMS,
  type AppNavigationIcon,
} from "@/shared/config/app-navigation";
import { cn } from "@/lib/utils";

const NAV_ICON_BY_NAME = {
  home: Home,
  notes: FileText,
  tasks: CheckSquare,
  progress: BarChart3,
} satisfies Record<AppNavigationIcon, typeof Home>;

/**
 * Checks whether a nav item should render as active for the current pathname.
 *
 * @param pathname - current app pathname
 * @param href - destination path represented by the nav item
 * @returns True when the nav item matches the current route
 */
function isActiveNavItem(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Renders the vertical left navigation rail for desktop app routes.
 *
 * @returns Desktop-only protected app navigation
 */
export function AppDesktopNav() {
  // Read the current pathname on the client so the active tab can update live.
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Desktop primary"
      className="h-full"
    >
      <div className="h-full flex flex-col gap-2 rounded-3xl border border-[var(--color-border)] px-2 py-2 [background-color:color-mix(in_srgb,var(--color-surface)_88%,transparent)] shadow-sm">
        {APP_NAVIGATION_ITEMS.map(function renderNavItem(item) {
          const Icon = NAV_ICON_BY_NAME[item.icon];
          const active = isActiveNavItem(pathname, item.href);

          return (
            <Link
              key={item.id}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-3 text-caption transition-colors duration-200",
                active
                  ? "[background-color:var(--color-accent)] [color:var(--color-accent-fg)]"
                  : "[color:var(--color-fg-muted)] hover:[background-color:var(--color-card-overlay)] hover:[color:var(--color-fg)]",
              )}
              href={item.href}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
