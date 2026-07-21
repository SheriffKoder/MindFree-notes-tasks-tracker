/**
 * @file entities/profile/client/patch-security.ts
 * Client fetcher for PATCH /api/profile/security (app lock).
 */

import type { ProfileSecurity } from "@/entities/profile/model/read-models";
import type { UpdateAppLockBody } from "@/entities/profile/schema";

export interface PatchSecurityResponse {
  security: ProfileSecurity;
}

/**
 * Enables, changes, or disables app lock.
 */
export async function fetchPatchSecurity(
  body: UpdateAppLockBody,
): Promise<PatchSecurityResponse> {
  const response = await fetch("/api/profile/security", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "Failed to update app lock.");
  }

  return response.json() as Promise<PatchSecurityResponse>;
}
