/**
 * @file entities/profile/hooks/use-update-preferences-mutation.ts
 * TanStack mutation for PATCH /api/profile/preferences with cache updates.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchPatchPreferences } from "@/entities/profile/client/patch-preferences";
import { profilePageQueryKey } from "@/entities/profile/client/query-keys";
import type { PreferencesPatch } from "@/entities/profile/model/preferences-patch";
import type { ProfilePageData } from "@/entities/profile/model/read-models";

/**
 * Patches preferences and merges the preferences slice into `profilePage` cache.
 */
export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: PreferencesPatch) => fetchPatchPreferences(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: profilePageQueryKey });

      const previous = queryClient.getQueryData<ProfilePageData>(
        profilePageQueryKey,
      );

      if (previous) {
        queryClient.setQueryData<ProfilePageData>(profilePageQueryKey, {
          ...previous,
          preferences: {
            ...previous.preferences,
            ...patch,
          },
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(profilePageQueryKey, context.previous);
      }
    },
    onSuccess: ({ preferences }) => {
      queryClient.setQueryData<ProfilePageData>(
        profilePageQueryKey,
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            preferences,
          };
        },
      );
    },
  });
}
