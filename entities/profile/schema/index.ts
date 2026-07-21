/**
 * @file entities/profile/schema/index.ts
 * Public surface for profile write contracts (Zod).
 *
 * File index:
 * - update-profile.schema — account PATCH (display name)
 * - update-preferences.schema — theme + export PATCH
 * - update-app-lock.schema — security PATCH (enable / change / disable)
 */

export {
  updateProfileBodySchema,
  type UpdateProfileBody,
} from "@/entities/profile/schema/update-profile.schema";
export {
  updatePreferencesBodySchema,
  type UpdatePreferencesBody,
} from "@/entities/profile/schema/update-preferences.schema";
export {
  updateAppLockBodySchema,
  type UpdateAppLockBody,
} from "@/entities/profile/schema/update-app-lock.schema";
export { nullableCssColorSchema } from "@/entities/profile/schema/css-color";
