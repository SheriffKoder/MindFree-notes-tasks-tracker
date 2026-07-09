/**
 * @file views/notes/ui/notes-client.tsx
 * Client boundary for the Notes page (hydration in Step 5).
 */

"use client";

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note";

/**
 * Props for the Notes client island.
 */
export interface NotesClientProps {
  /** Resolved URL month (`YYYY-MM`). */
  month: string;
  /** SSR calendar payload — wired to TanStack Query in Step 5. */
  initialCalendarNotes: CalendarNotesResponse;
  /** SSR general notes payload — wired to TanStack Query in Step 5. */
  initialGeneralNotes: GeneralNotesResponse;
}

/**
 * Renders the Notes page client boundary with SSR payloads held for hydration.
 *
 * @param props - month and initial server payloads
 * @returns blank Notes page shell (calendar UI arrives in later steps)
 */
export function NotesClient({
  month,
  initialCalendarNotes: _initialCalendarNotes,
  initialGeneralNotes: _initialGeneralNotes,
}: NotesClientProps) {
  void _initialCalendarNotes;
  void _initialGeneralNotes;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-h2">Notes</h2>
        <p className="text-body-muted">
          Server data for {month} is loaded. Calendar, lists, and the drawer arrive
          in the next steps.
        </p>
      </section>
    </div>
  );
}
