/**
 * @file entities/note/hydration/seed-notes-page-cache.ts
 * Writes SSR Notes-page payloads into a QueryClient (no dehydrate).
 *
 * Composable seeder: the entity owns its cache keys; the caller (a seed
 * component) dehydrates once after all entities have written. Reuses data
 * already fetched on the server — no duplicate repository calls.
 */

import type { QueryClient } from "@tanstack/react-query";

import type { NotesPageInitialData } from "@/entities/note/queries";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
} from "@/entities/note/client/query-keys";

/**
 * Seeds the calendar + general notes caches from an SSR payload.
 *
 * @param queryClient - per-request server QueryClient
 * @param data - SSR note payloads (resolved month + calendar/general notes)
 */
export function seedNotesPageCache(
  queryClient: QueryClient,
  data: Pick<NotesPageInitialData, "month" | "calendarNotes" | "generalNotes">,
): void {
  queryClient.setQueryData(calendarNotesQueryKey(data.month), data.calendarNotes);
  queryClient.setQueryData(generalNotesQueryKey, data.generalNotes);
}
