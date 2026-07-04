/**
 * @file shared/lib/supabase/client.ts
 * Browser Supabase client factory for auth-aware client components and actions.
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Reads the public Supabase environment variables used by the browser client.
 *
 * @returns Supabase URL and publishable key for the active environment
 * @throws Error when the required public environment variables are missing
 */
function getSupabaseBrowserEnv() {
  // Read the public project URL used by Supabase client requests.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Read the publishable key that is safe to expose to the browser.
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Fail early with a clear message if auth was not configured yet.
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  // Return the validated browser-safe Supabase configuration.
  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}

/**
 * Creates the shared browser Supabase client.
 *
 * @returns Browser Supabase client configured for auth/session persistence
 */
export function createClient() {
  // Resolve and validate the required browser-side environment values.
  const { supabaseUrl, supabasePublishableKey } = getSupabaseBrowserEnv();

  // Create the browser client used by auth forms and future client components.
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
