/**
 * @file shared/lib/auth/get-safe-path.ts
 * Normalizes redirect paths to block open redirects (e.g. `//evil.com`).
 */

/**
 * Returns a safe in-app relative path or the fallback when input is missing or unsafe.
 *
 * Rejects protocol-relative URLs (`//host`) and non-relative paths.
 *
 * @param path - requested redirect destination
 * @param fallbackPath - route used when `path` is unsafe
 * @returns Safe single-slash relative path
 */
export function getSafePath(
  path: unknown,
  fallbackPath: string,
): string {
  if (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//")
  ) {
    return path;
  }

  return fallbackPath;
}

/**
 * Like `getSafePath`, but never returns auth entry routes as the post-login target.
 *
 * @param path - requested redirect destination
 * @param fallbackPath - route used when `path` is unsafe or an auth page
 * @returns Safe app path suitable for password login redirects
 */
export function getSafeAppPath(path: unknown, fallbackPath: string): string {
  const safePath = getSafePath(path, fallbackPath);

  if (safePath === "/login" || safePath === "/signup") {
    return fallbackPath;
  }

  return safePath;
}
