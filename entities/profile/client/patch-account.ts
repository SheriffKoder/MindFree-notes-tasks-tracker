/**
 * @file entities/profile/client/patch-account.ts
 * Client fetcher for PATCH /api/profile/account.
 */

import type { ProfileAccount } from "@/entities/profile/model/read-models";

export interface PatchAccountResponse {
  account: ProfileAccount;
}

/**
 * Updates the authenticated user's display name.
 *
 * @param displayName - new display name (empty string allowed)
 * @returns updated account slice
 */
export async function fetchPatchAccount(
  displayName: string,
): Promise<PatchAccountResponse> {
  const response = await fetch("/api/profile/account", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to update profile.");
  }

  return response.json() as Promise<PatchAccountResponse>;
}
