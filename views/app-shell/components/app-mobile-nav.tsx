/**
 * @file views/app-shell/components/app-mobile-nav.tsx
 * Bottom mobile navigation for protected MindFree routes.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, CheckSquare, FileText, Home, User } from "lucide-react";

import { CardBackground } from "@/components/ui/card-background";
import {
  APP_NAVIGATION_ITEMS,
  type AppNavigationIcon,
} from "@/shared/config/app-navigation";
import {
  APP_SECONDARY_NAV_ITEM,
  type AppSecondaryNavigationIcon,
} from "@/shared/config/app-secondary-navigation";
import { cn } from "@/lib/utils";

const NAV_ICON_BY_NAME = {
  home: Home,
  notes: FileText,
  tasks: CheckSquare,
  reminders: Bell,
  progress: BarChart3,
} satisfies Record<AppNavigationIcon, typeof Home>;

const SECONDARY_NAV_ICON_BY_NAME = {
  profile: User,
} satisfies Record<AppSecondaryNavigationIcon, typeof User>;

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
 * Props for the mobile bottom navigation.
 */
export interface AppMobileNavProps {
  /** When false, Profile is omitted (demo account). */
  showProfileNav?: boolean;
}

/**
 * Renders the swipeable bottom navigation for mobile app routes.
 *
 * @returns Mobile-only bottom navigation
 */
export function AppMobileNav({ showProfileNav = true }: AppMobileNavProps) {
  // Read the current pathname on the client so the active tab can update live.
  const pathname = usePathname() ?? "/";
  const ProfileIcon = SECONDARY_NAV_ICON_BY_NAME[APP_SECONDARY_NAV_ITEM.icon];
  const profileActive = isActiveNavItem(pathname, APP_SECONDARY_NAV_ITEM.href);

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
                "group relative flex min-w-[72px] shrink-0 snap-center px-3 py-2 text-caption transition-colors duration-200",
                active
                  ? "[color:var(--color-accent-fg)]"
                  : "[color:var(--color-fg-muted)] hover:[color:var(--color-fg)]",
              )}
              href={item.href}
            >
              <CardBackground
                active={active}
                activeColor="var(--color-accent)"
                activeHoverColor="var(--color-accent-dark)"
                defaultColor="var(--color-card-overlay)"
                defaultHoverColor="var(--color-card-hover)"
                defaultBorderColor="var(--color-border)"
                activeBorderColor="var(--color-accent)"
                backgroundOpacity={0.2}
                borderOpacity={0.3}
                blur={0}
                radius="0.7rem"
              />
              <span className="relative z-10 flex flex-col items-center gap-1 h-full w-full">
                <Icon size={18} />
                <span>{item.label}</span>
              </span>
            </Link>
          );
        })}

        {showProfileNav ? (
          <Link
            aria-label={APP_SECONDARY_NAV_ITEM.label}
            className={cn(
              "group relative flex min-w-[72px] shrink-0 snap-center px-3 py-2 text-caption transition-colors duration-200",
              profileActive
                ? "[color:var(--color-accent-fg)]"
                : "[color:var(--color-fg-muted)] hover:[color:var(--color-fg)]",
            )}
            href={APP_SECONDARY_NAV_ITEM.href}
          >
            <CardBackground
              active={profileActive}
              activeColor="var(--color-accent)"
              activeHoverColor="var(--color-accent-dark)"
              defaultColor="var(--color-card-overlay)"
              defaultHoverColor="var(--color-card-hover)"
              defaultBorderColor="var(--color-border)"
              activeBorderColor="var(--color-accent)"
              backgroundOpacity={0.2}
              borderOpacity={0.3}
              blur={0}
              radius="0.7rem"
            />
            <span className="relative z-10 flex flex-col items-center gap-1 h-full w-full">
              <ProfileIcon size={18} />
              <span>{APP_SECONDARY_NAV_ITEM.label}</span>
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
