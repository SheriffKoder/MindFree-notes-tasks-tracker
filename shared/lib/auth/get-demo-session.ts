/**
 * @file shared/lib/auth/get-demo-session.ts
 * Server session helper for authenticated routes that need the demo-user flag.
 */

import { isDemoUserEmail } from "@/shared/lib/auth/demo-login-config";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Authenticated session fields used by SSR seeds and server routes.
 */
export interface AuthenticatedDemoSession {
  /** Signed-in Supabase user id. */
  userId: string;
  /** True when the signed-in email matches `DEMO_LOGIN_EMAIL`. */
  isDemoUser: boolean;
}

/**
 * Resolves the authenticated user id and demo flag from the request session.
 *
 * @returns current user id plus demo-session flag
 * @throws when unauthenticated
 */
export async function getAuthenticatedDemoSession(): Promise<AuthenticatedDemoSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    userId: user.id,
    isDemoUser: isDemoUserEmail(user.email),
  };
}
