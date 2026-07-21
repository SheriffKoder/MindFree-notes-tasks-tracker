/**
 * @file features/profile/apply-theme/lib/is-safe-image-url.ts
 * Lightweight check for background image URLs used by theme application.
 */

/**
 * Returns true when empty/null, or when the value is an http(s) URL.
 */
export function isSafeImageUrl(value: string | null | undefined): boolean {
  if (value == null) {
    return true;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
