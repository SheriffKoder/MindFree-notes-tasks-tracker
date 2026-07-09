/**
 * @file views/notes/index.tsx
 * Notes page composition for the protected app route tree.
 */

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note";
import { NotesClient } from "@/views/notes/ui/notes-client";

/**
 * Props for the Notes page view.
 */
export interface NotesViewProps {
  /** Resolved URL month (`YYYY-MM`). */
  month: string;
  /** SSR calendar payload. */
  initialCalendarNotes: CalendarNotesResponse;
  /** SSR general notes payload. */
  initialGeneralNotes: GeneralNotesResponse;
}

/**
 * Composes the Notes page client boundary with server-fetched initial data.
 *
 * @param props - month and initial payloads from the server page
 * @returns Notes page composition
 */
export function NotesView({
  month,
  initialCalendarNotes,
  initialGeneralNotes,
}: NotesViewProps) {
  return (
    <NotesClient
      month={month}
      initialCalendarNotes={initialCalendarNotes}
      initialGeneralNotes={initialGeneralNotes}
    />
  );
}
