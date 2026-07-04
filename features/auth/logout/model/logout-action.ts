/**
 * @file features/auth/logout/model/logout-action.ts
 * Server action that signs the current user out and redirects with auth feedback.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/shared/lib/supabase/server";

/**
 * Signs the current user out and redirects to the appropriate follow-up screen.
 */
export async function logout() {
  // Create the per-request server Supabase client for sign-out.
  const supabase = await createClient();

  // Ask Supabase to remove the active session and clear auth cookies.
  const { error } = await supabase.auth.signOut();

  // Keep the user on the protected page when sign-out fails.
  if (error) {
    redirect("/?error=logout_failed");
  }

  // Refresh auth-aware UI so cached layout state is cleared after sign-out.
  revalidatePath("/", "layout");

  // Send the user back to login with a friendly post-logout message.
  redirect("/login?message=signed_out");
}
