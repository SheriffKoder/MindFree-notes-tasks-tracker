/**
 * @file features/auth/signup/model/signup-schema.ts
 * Zod schema and inferred type for the email/password signup form.
 */

import { z } from "zod";

/**
 * Validates the fields required for creating a new account.
 */
export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});

/**
 * Parsed signup form values inferred from the schema.
 */
export type SignupSchema = z.infer<typeof signupSchema>;
