/**
 * @file entities/payment/repository/get-authenticated-user-id.ts
 * Resolves the authenticated user id for repository queries (defense in depth + RLS).
 *
 * Purpose: Session lookup for server-side payment reads and writes.
 * Used in: views/payments/ui/payments-hydration-seed.tsx, entities/payment/server.ts
 * Used for: SSR hydration seeding when the Payments page loads.
 *
 * Steps:
 * 1. Read the Supabase session user from the request.
 * 2. Throw when unauthenticated so callers can map to 401.
 */

import { createClient } from "@/shared/lib/supabase/server";

/**
 * Resolves the authenticated user id for repository queries (defense in depth + RLS).
 *
 * @returns current user id from the request session
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
