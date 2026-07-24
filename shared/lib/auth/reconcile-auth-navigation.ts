/**
 * @file shared/lib/auth/reconcile-auth-navigation.ts
 * Keeps the browser URL aligned with Supabase session state (once-only hard nav).
 *
 * Purpose: Long-lived / cross-tab auth changes miss proxy/layout on SPA tabs.
 *          One rule: no session → leave app routes; session → leave auth routes.
 * Used in: features/auth/session-expiry (AuthSessionSync)
 */

import { getSafeAppPath } from "@/shared/lib/auth/get-safe-path";

/** Login query flag that maps to the existing “Session expired” notice. */
export const SESSION_EXPIRY_LOGIN_ERROR = "session_missing";

const AUTH_PATHS = ["/login", "/signup"] as const;

let redirectStarted = false;

/**
 * Whether `pathname` is a public auth entry route.
 */
export function isAuthEntryPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (authPath) => pathname === authPath || pathname.startsWith(`${authPath}/`),
  );
}

/**
 * Builds `/login?error=session_missing&next=…` with a sanitized return path.
 */
export function buildSessionExpiryLoginUrl(nextPath: string): string {
  const safeNext = getSafeAppPath(nextPath, "/");
  const params = new URLSearchParams({
    error: SESSION_EXPIRY_LOGIN_ERROR,
    next: safeNext,
  });

  return `/login?${params.toString()}`;
}

/**
 * Resolves the post-login destination from an explicit path or the `next` query.
 */
export function resolvePostLoginAppPath(nextPath?: string | null): string {
  if (nextPath != null && nextPath !== "") {
    return getSafeAppPath(nextPath, "/");
  }

  if (typeof window === "undefined") {
    return "/";
  }

  const fromQuery = new URLSearchParams(window.location.search).get("next");
  return getSafeAppPath(fromQuery, "/");
}

export interface ReconcileAuthNavigationInput {
  /** Whether Supabase reports an active session. */
  hasSession: boolean;
  /** Current pathname (defaults to `window.location.pathname`). */
  pathname?: string;
  /** Current search string (defaults to `window.location.search`). */
  search?: string;
  /** Optional diagnostic label (logged in development only). */
  reason?: string;
}

/**
 * Hard-navigates when URL and session disagree; no-op when already consistent.
 *
 * @returns `true` when navigation was started; `false` if no-op, locked, or SSR
 */
export function reconcileAuthNavigation(
  input: ReconcileAuthNavigationInput,
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const pathname = input.pathname ?? window.location.pathname;
  const search = input.search ?? window.location.search;
  const onAuthPage = isAuthEntryPath(pathname);
  const currentAppPath = `${pathname}${search}`;

  let targetUrl: string | null = null;

  if (!input.hasSession && !onAuthPage) {
    targetUrl = buildSessionExpiryLoginUrl(currentAppPath);
  } else if (input.hasSession && onAuthPage) {
    targetUrl = resolvePostLoginAppPath(
      new URLSearchParams(search).get("next"),
    );
  }

  if (targetUrl == null) {
    return false;
  }

  if (redirectStarted) {
    return false;
  }

  redirectStarted = true;

  if (process.env.NODE_ENV === "development" && input.reason) {
    console.info(`[auth] reconcile (${input.reason}) → ${targetUrl}`);
  }

  window.location.assign(targetUrl);
  return true;
}

/**
 * Resets the once-only lock. For unit tests only.
 */
export function resetAuthNavigationLockForTests(): void {
  redirectStarted = false;
}
