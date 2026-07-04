/**
 * @file app/auth/confirm/route.ts
 * Auth confirmation route that verifies Supabase email tokens and redirects the user.
 */

import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/shared/lib/supabase/server";

/**
 * Normalizes a post-confirmation redirect path so only safe relative paths are used.
 *
 * @param nextPath - requested post-confirmation destination
 * @returns Safe in-app redirect target
 */
function getSafeNextPath(nextPath: string | null) {
  // Allow only single-slash relative paths that stay inside the app.
  if (
    typeof nextPath === "string" &&
    nextPath.startsWith("/") &&
    !nextPath.startsWith("//")
  ) {
    return nextPath;
  }

  // Fall back to the protected app entry page when no safe path is present.
  return "/";
}

/**
 * Verifies a Supabase confirmation token and redirects after success or failure.
 *
 * @param request - incoming confirmation route request
 * @returns Redirect response targeting the app entry route or login page
 */
export async function GET(request: NextRequest) {
  // Read the token values and optional redirect target from the request URL.
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextPath = getSafeNextPath(searchParams.get("next"));

  // Prepare the success redirect target without sensitive auth query params.
  const successRedirect = request.nextUrl.clone();
  successRedirect.pathname = nextPath;
  successRedirect.searchParams.delete("token_hash");
  successRedirect.searchParams.delete("type");
  successRedirect.searchParams.delete("next");

  // Verify the Supabase confirmation token when the required parameters exist.
  if (tokenHash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(successRedirect);
    }
  }

  // Send the user back to login when confirmation fails or the URL is invalid.
  const failureRedirect = request.nextUrl.clone();
  failureRedirect.pathname = "/login";
  failureRedirect.search = "";
  failureRedirect.searchParams.set("error", "confirmation_failed");

  return NextResponse.redirect(failureRedirect);
}
