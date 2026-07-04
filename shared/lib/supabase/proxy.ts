/**
 * @file shared/lib/supabase/proxy.ts
 * Session refresh helper used by the root proxy guard to keep Supabase auth cookies in sync.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Reads the public Supabase environment variables used by proxy auth checks.
 *
 * @returns Supabase URL and publishable key for the active environment
 * @throws Error when the required public environment variables are missing
 */
function getSupabaseProxyEnv() {
  // Read the project URL used while refreshing auth inside proxy.ts.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Read the publishable key used for secure SSR auth checks.
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Fail fast so missing auth configuration is obvious during setup.
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  // Return the validated proxy-safe Supabase configuration.
  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}

/**
 * Refreshes the Supabase session for the current request and returns the user.
 *
 * @param request - active Next.js proxy request
 * @returns Updated response plus the current authenticated user, if any
 */
export async function updateSession(request: NextRequest) {
  // Start with a pass-through response that preserves the current request.
  let response = NextResponse.next({
    request,
  });

  // Resolve and validate the shared Supabase SSR environment values.
  const { supabaseUrl, supabasePublishableKey } = getSupabaseProxyEnv();

  // Create the SSR client that reads request cookies and mirrors auth updates.
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      // Expose every incoming cookie so Supabase can read the current session.
      getAll() {
        return request.cookies.getAll();
      },

      // Mirror every auth cookie mutation onto both the request and response.
      setAll(cookiesToSet) {
        cookiesToSet.forEach(function syncRequestCookie({ name, value }) {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(function syncResponseCookie({
          name,
          value,
          options,
        }) {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh and validate the current session before any redirect logic runs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Return the updated response alongside the resolved user session.
  return {
    response,
    user,
  };
}
