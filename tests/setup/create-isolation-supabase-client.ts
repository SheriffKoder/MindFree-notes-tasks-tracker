/**
 * @file tests/setup/create-isolation-supabase-client.ts
 * Service-role Supabase client for Home isolation integration tests.
 * Bypasses RLS so `.eq("user_id", …)` app filters are what we prove.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Builds a service-role client against the configured Supabase project.
 *
 * @returns Supabase JS client with no session persistence
 * @throws Error when URL or service-role key is missing
 */
export function createIsolationSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for isolation int tests.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
