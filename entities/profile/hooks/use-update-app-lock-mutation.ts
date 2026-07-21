/**
 * @file entities/profile/hooks/use-update-app-lock-mutation.ts
 * TanStack mutation for PATCH /api/profile/security with cache updates.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchPatchSecurity } from "@/entities/profile/client/patch-security";
import { profilePageQueryKey } from "@/entities/profile/client/query-keys";
import type { ProfilePageData } from "@/entities/profile/model/read-models";
import type { UpdateAppLockBody } from "@/entities/profile/schema";

/**
 * Updates app lock and merges the security slice into `profilePage` cache.
 */
export function useUpdateAppLockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateAppLockBody) => fetchPatchSecurity(body),
    onSuccess: ({ security }) => {
      queryClient.setQueryData<ProfilePageData>(
        profilePageQueryKey,
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            security,
          };
        },
      );
    },
  });
}
