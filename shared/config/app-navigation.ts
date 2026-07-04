/**
 * @file shared/config/app-navigation.ts
 * Shared navigation configuration for protected MindFree routes.
 */

/**
 * Icon names supported by the protected app navigation.
 */
export type AppNavigationIcon = "home" | "notes" | "tasks" | "progress";

/**
 * Config shape for a protected app navigation item.
 */
export interface AppNavigationItem {
  /** Stable item identifier for rendering and selection logic. */
  id: string;
  /** Destination route path for the navigation item. */
  href: string;
  /** User-facing label shown in the navigation UI. */
  label: string;
  /** Icon token resolved by the consuming navigation view. */
  icon: AppNavigationIcon;
}

/**
 * Shared protected-route navigation config consumed by mobile and desktop navs.
 */
export const APP_NAVIGATION_ITEMS: AppNavigationItem[] = [
  {
    id: "home",
    href: "/",
    label: "Home",
    icon: "home",
  },
  {
    id: "notes",
    href: "/notes",
    label: "Notes",
    icon: "notes",
  },
  {
    id: "tasks",
    href: "/tasks",
    label: "Tasks",
    icon: "tasks",
  },
  {
    id: "progress",
    href: "/progress",
    label: "Progress",
    icon: "progress",
  },
];
