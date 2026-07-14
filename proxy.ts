/**
 * @file proxy.ts
 * Root request guard that refreshes Supabase auth state and redirects guests away from protected routes.
 */

import { updateSession } from "@/shared/lib/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGE_REDIRECT = "/";
const LOGIN_PAGE = "/login";
const PUBLIC_ROUTE_PREFIXES = ["/login", "/signup", "/auth/callback", "/auth/confirm"];

/**
 * Checks whether the current path should stay publicly accessible.
 *
 * @param pathname - current request pathname
 * @returns True when the path is part of the public auth flow
 */
function isPublicRoute(pathname: string) {
  // Allow auth entry pages and callback routes to bypass the protected app guard.
  return PUBLIC_ROUTE_PREFIXES.some(function matchesPublicRoute(publicRoute) {
    return pathname === publicRoute || pathname.startsWith(`${publicRoute}/`);
  });
}

/**
 * Checks whether the current path is an API route.
 *
 * @param pathname - current request pathname
 * @returns True when the path is under `/api`
 */
function isApiRoute(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

/**
 * Returns a JSON 401 while preserving session cookies from the proxy refresh.
 *
 * @param sessionResponse - pass-through response from `updateSession`
 * @returns Unauthorized JSON response
 */
function createApiUnauthorizedResponse(sessionResponse: NextResponse) {
  const unauthorized = NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 },
  );

  sessionResponse.cookies.getAll().forEach(function copySessionCookie(cookie) {
    unauthorized.cookies.set(cookie.name, cookie.value);
  });

  return unauthorized;
}

/**
 * Redirects guests to the login page while preserving the target route.
 *
 * @param request - active Next.js proxy request
 * @returns Redirect response targeting the login page
 */
function createLoginRedirect(request: NextRequest) {
  // Clone the current URL so we can preserve the original destination cleanly.
  const loginUrl = request.nextUrl.clone();

  // Send guests into the login route handled by the auth route group.
  loginUrl.pathname = LOGIN_PAGE;

  // Preserve the originally requested relative path for post-login navigation.
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  // Return the redirect response used by the protected-route guard.
  return NextResponse.redirect(loginUrl);
}

/**
 * Redirects authenticated users away from login and signup pages.
 *
 * @param request - active Next.js proxy request
 * @returns Redirect response targeting the app entry route
 */
function createAuthenticatedRedirect(request: NextRequest) {
  // Clone the current URL so we can safely rewrite the destination.
  const appUrl = request.nextUrl.clone();

  // Route signed-in users into the protected app shell.
  appUrl.pathname = AUTH_PAGE_REDIRECT;

  // Clear old query params because they are no longer needed after auth.
  appUrl.search = "";

  // Return the redirect response used by the public auth page guard.
  return NextResponse.redirect(appUrl);
}

/**
 * Refreshes the Supabase session and applies auth-aware route redirects.
 *
 * @param request - active Next.js proxy request
 * @returns Either the synchronized response or an auth redirect response
 */
export async function proxy(request: NextRequest) {
  // Read the current pathname once so all auth checks use the same value.
  const pathname = request.nextUrl.pathname;

  // Resolve the public-route flag before any session-based redirect logic.
  const publicRoute = isPublicRoute(pathname);

  // Refresh auth cookies and resolve the active user for this request.
  const { response, user } = await updateSession(request);

  // Block access to protected routes when there is no authenticated user.
  if (!user && !publicRoute) {
    if (isApiRoute(pathname)) {
      return createApiUnauthorizedResponse(response);
    }

    return createLoginRedirect(request);
  }

  // Prevent signed-in users from lingering on login and signup pages.
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return createAuthenticatedRedirect(request);
  }

  // Return the synchronized pass-through response for allowed requests.
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
