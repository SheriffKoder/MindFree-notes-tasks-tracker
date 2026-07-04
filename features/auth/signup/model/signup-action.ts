/**
 * @file features/auth/signup/model/signup-action.ts
 * Server action that handles email and password signup for the signup feature.
 */

"use server";

import type { SignupActionState } from "@/features/auth/signup/model/signup-action-state";
import { signupSchema } from "@/features/auth/signup/model/signup-schema";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Creates a new user account and starts the email confirmation flow.
 *
 * @param formData - submitted signup form data
 * @returns Error or success state for the signup screen
 */
export async function signup(formData: FormData): Promise<SignupActionState> {
  // Validate the raw submitted values at the server boundary.
  const validatedFields = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Stop early when the submitted values fail schema validation.
  if (!validatedFields.success) {
    return {
      errorMessage:
        validatedFields.error.issues[0]?.message ?? "Invalid signup details.",
      successMessage: null,
    };
  }

  // Read the validated signup fields after schema parsing.
  const { email, password } = validatedFields.data;

  // Build the confirmation redirect target for local and deployed environments.
  const appUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  // Create the per-request server Supabase client for account creation.
  const supabase = await createClient();

  // Ask Supabase to create the account and send the confirmation email.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/confirm`,
    },
  });

  // Return the server error so the client can render it inline.
  if (error) {
    return {
      errorMessage: error.message,
      successMessage: null,
    };
  }

  // Tell the user to confirm their email instead of assuming a session exists.
  return {
    errorMessage: null,
    successMessage:
      "Check your email for a confirmation link to finish creating your account.",
  };
}
