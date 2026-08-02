/**
 * @file shared/calendar/lib/is-fine-pointer-hover.ts
 * Desktop gate for calendar cursor-tooltip listeners.
 *
 * Matches devices that both hover and use a fine pointer (typical mouse/trackpad).
 * Touch / coarse pointers skip store writes so tips never open on tap-drag.
 */

const FINE_POINTER_HOVER_QUERY = "(hover: hover) and (pointer: fine)";

let cachedMatches: boolean | null = null;
let mediaQueryList: MediaQueryList | null = null;

function ensureMediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }

  if (!mediaQueryList) {
    mediaQueryList = window.matchMedia(FINE_POINTER_HOVER_QUERY);
    cachedMatches = mediaQueryList.matches;
    mediaQueryList.addEventListener("change", (event) => {
      cachedMatches = event.matches;
    });
  }

  return mediaQueryList;
}

/**
 * Whether the current environment should drive the calendar hover tip.
 *
 * Safe to call from pointer handlers; returns `false` during SSR.
 */
export function isFinePointerHover(): boolean {
  const mql = ensureMediaQuery();

  if (!mql) {
    return false;
  }

  if (cachedMatches === null) {
    cachedMatches = mql.matches;
  }

  return cachedMatches;
}
