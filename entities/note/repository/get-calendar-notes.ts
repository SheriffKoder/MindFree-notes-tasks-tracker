/**
 * @file entities/note/repository/get-calendar-notes.ts
 * Fetches calendar notes for a month (`date IS NOT NULL`).
 */

import { getMonthRange } from "@/entities/note/lib/parse-month";
import type { Note, NoteRow } from "@/entities/note/model/types";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches calendar notes for the given month (`date IS NOT NULL`).
 *
 * @param month - `YYYY-MM` month key
 * @returns calendar notes in the month, ordered by date ascending
 */
export async function getCalendarNotesForMonth(
  userId: string,
  month: string,
): Promise<Note[]> {
  const { monthStart, monthEnd } = getMonthRange(month);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .gte("date", monthStart)
    .lt("date", monthEnd)
    .not("date", "is", null)
    .order("date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch calendar notes: ${error.message}`);
  }

  return (data as NoteRow[] | null)?.map(mapNoteRow) ?? [];
}
