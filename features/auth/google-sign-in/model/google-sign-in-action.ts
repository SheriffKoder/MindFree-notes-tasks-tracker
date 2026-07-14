/**
 * @file features/auth/google-sign-in/model/google-sign-in-action.ts
 * Server action that starts the Supabase Google OAuth flow.
 */

"use server";

import { redirect } from "next/navigation";

import { getSafePath } from "@/shared/lib/auth/get-safe-path";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Starts the Google OAuth sign-in flow and redirects to the provider URL.
 *
 * @param formData - submitted Google sign-in form data
 */
export async function signInWithGoogle(formData: FormData) {
  // Read and normalize the app destinations used by the OAuth flow.
  const nextPath = getSafePath(formData.get("next"), "/");
  const errorRedirectPath = getSafePath(formData.get("errorRedirect"), "/login");

  // Build the callback origin for local and deployed environments.
  const appUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  // Build the OAuth callback URL and preserve the final in-app destination.
  const callbackUrl = new URL("/auth/callback", appUrl);
  callbackUrl.searchParams.set("next", nextPath);
  callbackUrl.searchParams.set("errorRedirect", errorRedirectPath);

  // Create the per-request server Supabase client for the OAuth request.
  const supabase = await createClient();

  // Ask Supabase to create the Google OAuth redirect URL.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  // Send the user back to the current auth page when the provider URL fails.
  if (error || !data.url) {
    redirect(`${errorRedirectPath}?error=google_signin_failed`);
  }

  // Redirect the browser to the provider sign-in screen.
  redirect(data.url);
}
