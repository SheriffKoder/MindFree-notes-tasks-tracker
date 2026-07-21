/**
 * @file entities/profile/schema/update-app-lock.schema.ts
 * Zod contracts for PATCH /api/profile/security.
 *
 * Plaintext passwords travel only in the request body; the server stores a hash.
 */

import { z } from "zod";

const passwordSchema = z
  .string()
  .min(4, "Password must be at least 4 characters.")
  .max(128, "Password must be 128 characters or fewer.");

/**
 * App lock mutation:
 * - `enable` — require `password`
 * - `change` — require `currentPassword` + `password`
 * - `disable` — require `currentPassword`
 */
export const updateAppLockBodySchema = z
  .object({
    action: z.enum(["enable", "change", "disable"]),
    password: passwordSchema.optional(),
    currentPassword: z.string().min(1).max(128).optional(),
  })
  .superRefine(function validateAppLockAction(body, ctx) {
    if (body.action === "enable") {
      if (!body.password) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Password is required to enable app lock.",
        });
      }
      return;
    }

    if (body.action === "change") {
      if (!body.currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["currentPassword"],
          message: "Current password is required to change app lock.",
        });
      }
      if (!body.password) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "New password is required to change app lock.",
        });
      }
      return;
    }

    // disable
    if (!body.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "Current password is required to disable app lock.",
      });
    }
  });

export type UpdateAppLockBody = z.infer<typeof updateAppLockBodySchema>;
