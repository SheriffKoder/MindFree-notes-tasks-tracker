/**
 * @file entities/note/mutations/delete-note-client.ts
 * Client fetcher for DELETE /api/notes/:id.
 */

/**
 * Deletes one note row.
 *
 * @param id - note row id
 */
export async function fetchDeleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to delete note.");
  }
}
