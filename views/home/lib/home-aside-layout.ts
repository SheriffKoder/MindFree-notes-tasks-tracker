/**
 * @file views/home/lib/home-aside-layout.ts
 * Shared layout tokens for the Home right aside column.
 */

/** Width constraints shared by desktop aside and mobile drawer panel. */
export const HOME_ASIDE_LAYOUT_CLASS =
  "h-full min-h-0 w-[30vw] max-w-[400px] shrink-0";

/** Rounded bordered surface for the desktop aside column. */
export const HOME_ASIDE_SURFACE_CLASS =
  "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)]";
