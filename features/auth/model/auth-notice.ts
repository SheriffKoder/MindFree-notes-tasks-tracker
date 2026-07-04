/**
 * @file features/auth/model/auth-notice.ts
 * Shared auth notice helpers for query-driven error and status states.
 */

/**
 * Narrow search param value type used by App Router page props.
 */
export type SearchParamValue = string | string[] | undefined;

/**
 * Search params record shape used by auth-aware pages.
 */
export type SearchParamsRecord = Record<string, SearchParamValue>;

/**
 * Visual intent for auth notice banners.
 */
export type AuthNoticeTone = "error" | "success" | "info";

/**
 * Renderable auth notice content for pages and forms.
 */
export interface AuthNotice {
  /** Short status title shown in the banner. */
  title: string;
  /** Supporting message that explains the state or fallback. */
  description: string;
  /** Visual tone used by the shared banner component. */
  tone: AuthNoticeTone;
}

/**
 * Reads the first string value from a search param entry.
 *
 * @param value - raw App Router search param value
 * @returns First string value or null when none is available
 */
function getFirstParamValue(value: SearchParamValue) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}

/**
 * Validates a post-auth redirect path so only safe in-app routes are used.
 *
 * @param value - raw next param from the request URL
 * @returns Safe in-app destination
 */
export function getSafeNextPath(value: SearchParamValue) {
  const nextPath = getFirstParamValue(value);

  if (
    typeof nextPath === "string" &&
    nextPath.startsWith("/") &&
    !nextPath.startsWith("//") &&
    nextPath !== "/login" &&
    nextPath !== "/signup"
  ) {
    return nextPath;
  }

  return "/";
}

/**
 * Resolves an auth-page notice from the current search params.
 *
 * @param searchParams - current page search params
 * @param page - auth page consuming the notice
 * @returns Renderable notice for login/signup or null when no banner is needed
 */
export function getAuthPageNotice(
  searchParams: SearchParamsRecord,
  page: "login" | "signup",
) {
  const message = getFirstParamValue(searchParams.message);
  const error = getFirstParamValue(searchParams.error);

  if (page === "login" && message === "signed_out") {
    return {
      title: "Signed out",
      description: "Your session has been closed. Sign in again whenever you're ready.",
      tone: "success",
    } satisfies AuthNotice;
  }

  if (page === "login" && error === "confirmation_failed") {
    return {
      title: "Confirmation failed",
      description:
        "That confirmation link could not be verified. Try signing in again or request a new email.",
      tone: "error",
    } satisfies AuthNotice;
  }

  if (page === "login" && error === "session_missing") {
    return {
      title: "Session expired",
      description: "Your session could not be restored. Please sign in again.",
      tone: "error",
    } satisfies AuthNotice;
  }

  if (error === "google_signin_failed") {
    return {
      title: "Google sign-in failed",
      description:
        "Google sign-in could not be completed. Please try again or use email and password instead.",
      tone: "error",
    } satisfies AuthNotice;
  }

  return null;
}

/**
 * Resolves protected-app notices from the current search params.
 *
 * @param searchParams - current page search params
 * @returns Renderable notice for protected pages or null when no banner is needed
 */
export function getProtectedAppNotice(searchParams: SearchParamsRecord) {
  const error = getFirstParamValue(searchParams.error);

  if (error === "logout_failed") {
    return {
      title: "Could not sign out",
      description:
        "MindFree could not close your session cleanly. Please try signing out again.",
      tone: "error",
    } satisfies AuthNotice;
  }

  return null;
}
