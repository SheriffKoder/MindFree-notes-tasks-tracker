/**
 * @file entities/profile/hooks/index.ts
 * Segment barrel for profile TanStack Query hooks.
 */

export { useProfilePageQuery } from "@/entities/profile/hooks/use-profile-page-query";
export {
  useUpdateProfileMutation,
  type UpdateProfileMutationInput,
} from "@/entities/profile/hooks/use-update-profile-mutation";
export { useUpdatePreferencesMutation } from "@/entities/profile/hooks/use-update-preferences-mutation";
export { useUpdateAppLockMutation } from "@/entities/profile/hooks/use-update-app-lock-mutation";
