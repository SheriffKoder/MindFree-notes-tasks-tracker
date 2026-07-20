/**
 * @file entities/profile/repository/get-authenticated-user-id.ts
 * Resolves the authenticated user id for profile repository queries.
 */

import { createClient } from "@/shared/lib/supabase/server";

/**
 * Resolves the authenticated user id from the request session.
 *
 * @returns current user id
 * @throws when unauthenticated
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user.id;
}
