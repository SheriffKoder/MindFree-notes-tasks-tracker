/**
 * @file shared/lib/auth/require-authenticated-user.ts
 * Shared auth guard for API route handlers.
 */

import { createClient } from "@/shared/lib/supabase/server";

/**
 * Ensures the request has an authenticated Supabase session.
 *
 * @returns authenticated user id, or `null` when unauthenticated
 */
export async function requireAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}
