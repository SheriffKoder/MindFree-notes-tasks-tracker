/**
 * @file features/profile/theme-section/model/is-safe-image-url.ts
 * Lightweight client check for background image URL drafts.
 */

/**
 * Returns true when empty/null, or when the value is an http(s) URL.
 * Invalid values must not crash the page — callers skip persist / preview.
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
