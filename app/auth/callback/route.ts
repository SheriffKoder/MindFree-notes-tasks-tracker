/**
 * @file app/auth/callback/route.ts
 * OAuth callback route that exchanges the Supabase auth code for a session and redirects the user.
 */

import { NextResponse, type NextRequest } from "next/server";

import { getSafePath } from "@/shared/lib/auth/get-safe-path";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Exchanges the OAuth code for a session and redirects after success or failure.
 *
 * @param request - incoming OAuth callback request
 * @returns Redirect response targeting the app entry route or the originating auth page
 */
export async function GET(request: NextRequest) {
  // Read the OAuth result and safe redirect targets from the callback URL.
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafePath(request.nextUrl.searchParams.get("next"), "/");
  const errorRedirectPath = getSafePath(
    request.nextUrl.searchParams.get("errorRedirect"),
    "/login",
  );

  // Exchange the Supabase auth code for a session when the callback includes one.
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
  }

  // Send the user back to the originating auth page when the callback fails.
  const failureRedirect = new URL(errorRedirectPath, request.url);
  failureRedirect.searchParams.set("error", "google_signin_failed");

  return NextResponse.redirect(failureRedirect);
}
