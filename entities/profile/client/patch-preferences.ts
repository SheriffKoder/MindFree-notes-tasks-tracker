/**
 * @file entities/profile/client/patch-preferences.ts
 * Client fetcher for PATCH /api/profile/preferences.
 */

import type { ProfilePreferences } from "@/entities/profile/model/read-models";
import type { PreferencesPatch } from "@/entities/profile/model/preferences-patch";

export interface PatchPreferencesResponse {
  preferences: ProfilePreferences;
}

/**
 * Partially updates theme / custom / export preferences.
 *
 * @param patch - preference fields to update
 * @returns updated preferences slice
 */
export async function fetchPatchPreferences(
  patch: PreferencesPatch,
): Promise<PatchPreferencesResponse> {
  const response = await fetch("/api/profile/preferences", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to update preferences.");
  }

  return response.json() as Promise<PatchPreferencesResponse>;
}
