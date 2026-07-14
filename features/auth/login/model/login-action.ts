/**
 * @file features/auth/login/model/login-action.ts
 * Server action that handles email and password sign-in for the login feature.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { LoginActionState } from "@/features/auth/login/model/login-action-state";
import { loginSchema } from "@/features/auth/login/model/login-schema";
import { getSafeAppPath } from "@/shared/lib/auth/get-safe-path";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Signs a user in with email and password, then redirects on success.
 *
 * @param formData - submitted login form data
 * @returns Error state when validation or authentication fails
 */
export async function login(formData: FormData): Promise<LoginActionState> {
  // Validate the raw submitted values at the server boundary.
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Stop early when the submitted values fail schema validation.
  if (!validatedFields.success) {
    return {
      errorMessage: validatedFields.error.issues[0]?.message ?? "Invalid login details.",
    };
  }

  // Read the validated credentials after the schema has normalized them.
  const { email, password } = validatedFields.data;
  const nextPath = formData.get("next");
  const redirectPath = getSafeAppPath(nextPath, "/");

  // Create the per-request server Supabase client for sign-in.
  const supabase = await createClient();

  // Attempt the actual email/password authentication with Supabase.
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Return an inline error instead of redirecting away from the login screen.
  if (error) {
    return {
      errorMessage: error.message,
    };
  }

  // Refresh the root layout so auth-aware UI reads the new session.
  revalidatePath("/", "layout");

  // Send the user to the originally requested protected route, if any.
  redirect(redirectPath);
}

/**
 * Form-action entry point for native and progressive-enhancement submits.
 *
 * @param formData - submitted login form data
 */
export async function submitLoginForm(formData: FormData): Promise<void> {
  await login(formData);
}
