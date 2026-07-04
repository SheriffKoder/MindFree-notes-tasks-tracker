/**
 * @file shared/lib/supabase/server.ts
 * Server Supabase client factory for server components, route handlers, and actions.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Reads the public Supabase environment variables used by server-side auth.
 *
 * @returns Supabase URL and publishable key for the active environment
 * @throws Error when the required public environment variables are missing
 */
function getSupabaseServerEnv() {
  // Read the project URL used by server-side Supabase requests.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Read the publishable key used for SSR-safe authenticated requests.
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Stop early with a clear message if Supabase auth is not configured.
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  // Return the validated environment values for client creation.
  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}

/**
 * Creates the per-request server Supabase client.
 *
 * @returns Server Supabase client wired to the current request cookies
 */
export async function createClient() {
  // Read the mutable request cookie store provided by the App Router.
  const cookieStore = await cookies();

  // Resolve and validate the shared Supabase SSR environment values.
  const { supabaseUrl, supabasePublishableKey } = getSupabaseServerEnv();

  // Create the per-request server client for secure auth-aware operations.
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      // Expose all request cookies so Supabase can read the current session.
      getAll() {
        return cookieStore.getAll();
      },

      // Persist any auth cookie updates back into the current request context.
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(function setServerCookie({
            name,
            value,
            options,
          }) {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore cookie writes from server components because proxy.ts
          // handles session refresh and cookie synchronization per request.
        }
      },
    },
  });
}
