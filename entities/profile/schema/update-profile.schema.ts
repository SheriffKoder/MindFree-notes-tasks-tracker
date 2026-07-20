/**
 * @file entities/profile/schema/update-profile.schema.ts
 * Zod contracts for PATCH /api/profile/account.
 */

import { z } from "zod";

/** PATCH body — update display name on `mf_profiles`. */
export const updateProfileBodySchema = z.object({
  displayName: z
    .string()
    .max(120, "Display name must be 120 characters or fewer."),
});

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
