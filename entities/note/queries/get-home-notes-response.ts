/**
 * @file entities/note/queries/get-home-notes-response.ts
 * Read use-case: quick note slot and starred carousel for the Home page.
 */

import type { HomeNotesResponse } from "@/entities/note/model/types";
import {
  getQuickNote,
  getStarredNotes,
} from "@/entities/note/repository/note-repository";

/**
 * Fetches the home notes payload in parallel.
 *
 * Used by `GET /api/notes/home` and SSR hydration on `/`.
 *
 * @returns quick note slot plus starred notes (quick excluded from starred list)
 */
export async function getHomeNotesResponse(
  userId: string,
): Promise<HomeNotesResponse> {
  const [quickNote, starredNotes] = await Promise.all([
    getQuickNote(userId),
    getStarredNotes(userId),
  ]);

  return { quickNote, starredNotes };
}
