/**
 * @file shared/drawer/lib/drawer-panel-classes.ts
 * Layout class tokens for the drawer shell — single place to tune width and motion.
 */

/** Backdrop behind the sliding panel. */
export const DRAWER_OVERLAY_CLASS =
  "absolute inset-0 bg-black/30 animate-in fade-in-0 duration-200";

/**
 * Shared panel chrome (no desktop width — set via fixed or resizable tokens).
 * Full width on mobile; desktop width comes from `DRAWER_PANEL_FIXED_WIDTH_CLASS`
 * or `--drawer-width` when resizable.
 */
export const DRAWER_PANEL_CLASS =
  "relative flex h-full w-full max-w-full flex-col border-l border-[var(--color-border)] [background-color:var(--color-drawer)] shadow-[var(--shadow-elevation)] animate-in slide-in-from-right duration-300";

/** Non-resizable drawers: fixed 35vw on desktop. */
export const DRAWER_PANEL_FIXED_WIDTH_CLASS = "md:w-[35vw]";

/**
 * Resizable drawers: mobile full-width; desktop width from `--drawer-width`
 * (set inline from `useResizableWidth`).
 */
export const DRAWER_PANEL_RESIZABLE_WIDTH_CLASS =
  "md:w-[var(--drawer-width)] md:max-w-[75vw]";

/** Left-edge drag handle for resizable drawers (desktop only). */
export const DRAWER_RESIZE_HANDLE_CLASS =
  "absolute inset-y-0 left-0 z-10 hidden w-1.5 cursor-col-resize touch-none md:block hover:[background-color:color-mix(in_srgb,var(--color-accent)_35%,transparent)] data-[resizing=true]:[background-color:color-mix(in_srgb,var(--color-accent)_50%,transparent)]";

/** Thin top row — back control only; feature chrome lives in scrollable body. */
export const DRAWER_HEADER_CLASS =
  "flex shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-3 py-1.5";

/** Scrollable body slot for `children`. */
export const DRAWER_BODY_CLASS = "min-h-0 flex-1 overflow-y-auto px-4 py-4";
