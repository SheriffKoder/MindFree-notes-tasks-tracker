/**
 * @file entities/profile/repository/get-authenticated-user-id.ts
 * Resolves the authenticated user for profile repository queries.
 */

import { createClient } from "@/shared/lib/supabase/server";

/** Authenticated user identity needed by profile reads. */
export interface AuthenticatedProfileUser {
  id: string;
  /** Auth email; empty string when missing. */
  email: string;
}

/**
 * Resolves the authenticated user id and email from the request session.
 *
 * @returns current user id and email
 * @throws when unauthenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedProfileUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    id: user.id,
    email: user.email ?? "",
  };
}

/**
 * Resolves the authenticated user id from the request session.
 *
 * @returns current user id
 * @throws when unauthenticated
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const user = await getAuthenticatedUser();
  return user.id;
}
