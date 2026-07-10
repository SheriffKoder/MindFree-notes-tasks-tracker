/**
 * @file shared/drawer/lib/drawer-panel-classes.ts
 * Layout class tokens for the drawer shell — single place to tune width and motion.
 */

/** Backdrop behind the sliding panel. */
export const DRAWER_OVERLAY_CLASS =
  "absolute inset-0 bg-black/30 animate-in fade-in-0 duration-200";

/** Right-side panel — full width on mobile, capped on desktop. */
export const DRAWER_PANEL_CLASS =
  "relative flex h-full w-full max-w-full flex-col border-l border-[var(--color-border)] [background-color:var(--color-drawer)] shadow-[var(--shadow-elevation)] animate-in slide-in-from-right duration-300 md:max-w-md";

/** Fixed header row above scrollable content. */
export const DRAWER_HEADER_CLASS =
  "flex shrink-0 items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3";

/** Scrollable body slot for `children`. */
export const DRAWER_BODY_CLASS = "min-h-0 flex-1 overflow-y-auto px-4 py-4";
