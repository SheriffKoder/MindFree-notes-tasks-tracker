/**
 * @file entities/activity/client/patch-activity.ts
 * Client fetcher for PATCH /api/activities/:id.
 */

import type { Activity } from "@/entities/activity/model/types";
import type { UpdateActivityBody } from "@/entities/activity/schema/update-activity.schema";

export interface PatchActivityResponse {
  activity: Activity;
}

/**
 * Partially updates one activity definition (edit / archive / restore).
 *
 * @param id - activity row id
 * @param body - partial patch body
 * @returns server-confirmed activity
 */
export async function fetchPatchActivity(
  id: string,
  body: UpdateActivityBody,
): Promise<PatchActivityResponse> {
  const response = await fetch(`/api/activities/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    const error = new Error(
      errorBody?.error ?? "Failed to update activity.",
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json() as Promise<PatchActivityResponse>;
}
