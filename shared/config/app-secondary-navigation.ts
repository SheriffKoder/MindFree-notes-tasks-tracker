/**
 * @file shared/config/app-secondary-navigation.ts
 * Secondary navigation for protected MindFree routes (settings / profile).
 *
 * Kept separate from primary tabs so Profile can be pinned (desktop: bottom of
 * rail via `mt-auto`; mobile: end of the bottom bar scroll row).
 */

/**
 * Icon names supported by secondary app navigation.
 */
export type AppSecondaryNavigationIcon = "profile";

/**
 * Config shape for a secondary navigation item.
 */
export interface AppSecondaryNavigationItem {
  /** Stable item identifier for rendering and selection logic. */
  id: string;
  /** Destination route path for the navigation item. */
  href: string;
  /** User-facing label shown in the navigation UI. */
  label: string;
  /** Icon token resolved by the consuming navigation view. */
  icon: AppSecondaryNavigationIcon;
}

/**
 * Profile / settings entry for desktop rail and mobile bottom nav.
 */
export const APP_SECONDARY_NAV_ITEM: AppSecondaryNavigationItem = {
  id: "profile",
  href: "/profile",
  label: "Profile",
  icon: "profile",
};
