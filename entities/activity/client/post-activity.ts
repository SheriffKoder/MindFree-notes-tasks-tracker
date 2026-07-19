/**
 * @file entities/activity/client/post-activity.ts
 * Client fetcher for POST /api/activities.
 */

import type {
  CreateActivityBody,
  CreateActivityResponse,
} from "@/entities/activity/schema/create-activity.schema";

/**
 * Creates an activity definition.
 *
 * @param body - validated create payload (`kind` + form fields)
 * @returns server-confirmed activity
 */
export async function fetchPostActivity(
  body: CreateActivityBody,
): Promise<CreateActivityResponse> {
  const response = await fetch("/api/activities", {
    method: "POST",
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
    throw new Error(errorBody?.error ?? "Failed to create activity.");
  }

  return response.json() as Promise<CreateActivityResponse>;
}
