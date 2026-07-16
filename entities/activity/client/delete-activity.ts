/**
 * @file entities/activity/client/delete-activity.ts
 * Client fetcher for DELETE /api/activities/:id.
 */

/**
 * Hard-deletes one activity definition (records cascade on the server).
 *
 * @param id - activity row id
 */
export async function fetchDeleteActivity(id: string): Promise<void> {
  const response = await fetch(`/api/activities/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to delete activity.");
  }
}
