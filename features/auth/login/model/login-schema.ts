/**
 * @file features/auth/login/model/login-schema.ts
 * Zod schema and inferred type for the email/password login form.
 */

import { z } from "zod";

/**
 * Validates the fields required for email/password sign-in.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

/**
 * Parsed login form values inferred from the schema.
 */
export type LoginSchema = z.infer<typeof loginSchema>;
