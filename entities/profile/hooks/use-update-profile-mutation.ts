/**
 * @file entities/profile/hooks/use-update-profile-mutation.ts
 * TanStack mutation for PATCH /api/profile/account with cache updates.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchPatchAccount } from "@/entities/profile/client/patch-account";
import { profilePageQueryKey } from "@/entities/profile/client/query-keys";
import type { ProfilePageData } from "@/entities/profile/model/read-models";

export interface UpdateProfileMutationInput {
  displayName: string;
}

/**
 * Patches display name and merges the account slice into `profilePage` cache.
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ displayName }: UpdateProfileMutationInput) =>
      fetchPatchAccount(displayName),
    onMutate: async ({ displayName }) => {
      await queryClient.cancelQueries({ queryKey: profilePageQueryKey });

      const previous = queryClient.getQueryData<ProfilePageData>(
        profilePageQueryKey,
      );

      if (previous) {
        queryClient.setQueryData<ProfilePageData>(profilePageQueryKey, {
          ...previous,
          account: {
            ...previous.account,
            displayName,
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
    onSuccess: ({ account }) => {
      queryClient.setQueryData<ProfilePageData>(
        profilePageQueryKey,
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            account,
          };
        },
      );
    },
  });
}
