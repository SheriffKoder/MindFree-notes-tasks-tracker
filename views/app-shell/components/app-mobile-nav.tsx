/**
 * @file views/app-shell/components/app-mobile-nav.tsx
 * Bottom mobile navigation for protected MindFree routes.
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
 * Renders the swipeable bottom navigation for mobile app routes.
 *
 * @returns Mobile-only bottom navigation
 */
export function AppMobileNav() {
  // Read the current pathname on the client so the active tab can update live.
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] [background-color:var(--color-surface)]"
    >
      <div className="flex snap-x items-stretch gap-2 overflow-x-auto px-3 py-3">
        {APP_NAVIGATION_ITEMS.map(function renderNavItem(item) {
          const Icon = NAV_ICON_BY_NAME[item.icon];
          const active = isActiveNavItem(pathname, item.href);

          return (
            <Link
              key={item.id}
              className={cn(
                "flex min-w-[72px] shrink-0 snap-center flex-col items-center gap-1 rounded-2xl px-3 py-2 text-caption transition-colors duration-200",
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
