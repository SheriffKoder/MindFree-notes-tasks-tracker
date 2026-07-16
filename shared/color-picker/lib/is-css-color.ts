/**
 * @file shared/color-picker/lib/is-css-color.ts
 * Whether a string is a CSS color the browser (or hex fallback) accepts.
 */

const HEX_COLOR_PATTERN =
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * Returns true when `value` can be used as a CSS `color` / `background-color`.
 * Prefers `CSS.supports`; falls back to a hex-only regex outside the browser.
 */
export function isCssColor(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
    return CSS.supports("color", trimmed);
  }
  return HEX_COLOR_PATTERN.test(trimmed);
}
