/**
 * @file entities/activity/client/record/activity-records-mutation.ts
 * Client write fetchers for /api/activity-records (upsert + delete by key).
 *
 * Records are the write side of the Activity entity; their fetchers live under
 * `client/record/` beside the definition fetchers. Read fetcher/options stay in
 * `client/activity-records-query.ts`.
 *
 * Function index:
 * - fetchUpsertActivityRecord (POST)
 * - fetchDeleteActivityRecord (DELETE by natural key)
 */

import type {
  UpsertActivityRecordBody,
  UpsertActivityRecordResponse,
} from "@/entities/activity/schema/record";

/** Natural-key body for a record delete. */
export type DeleteActivityRecordBody = Pick<
  UpsertActivityRecordBody,
  "taskId" | "date"
>;

/**
 * Upserts today's record (absolute count/duration) by `(taskId, date)`.
 *
 * @param body - validated upsert payload
 * @returns server-confirmed record
 * @throws when the request fails
 */
export async function fetchUpsertActivityRecord(
  body: UpsertActivityRecordBody,
): Promise<UpsertActivityRecordResponse> {
  const response = await fetch("/api/activity-records", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(errorBody?.error ?? "Failed to upsert activity record.");
  }

  return response.json() as Promise<UpsertActivityRecordResponse>;
}

/**
 * Deletes the record for one `(taskId, date)` (delete-on-empty).
 *
 * @param body - natural key to remove
 * @throws when the request fails
 */
export async function fetchDeleteActivityRecord(
  body: DeleteActivityRecordBody,
): Promise<void> {
  const response = await fetch("/api/activity-records", {
    method: "DELETE",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(errorBody?.error ?? "Failed to delete activity record.");
  }
}
