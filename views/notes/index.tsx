/**
 * @file views/notes/index.tsx
 * Notes page composition for the protected app route tree.
 */

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note";
import type { NotesViewId } from "@/shared/view-switcher";
import { NotesClient } from "@/views/notes/ui/notes-client";

/**
 * Props for the Notes page view.
 */
export interface NotesViewProps {
  /** Resolved URL month (`YYYY-MM`). */
  month: string;
  /** Resolved URL view (`calendar`, `month-notes`, `general-notes`). */
  view: NotesViewId;
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
  view,
  initialCalendarNotes,
  initialGeneralNotes,
}: NotesViewProps) {
  return (
    <NotesClient
      month={month}
      view={view}
      initialCalendarNotes={initialCalendarNotes}
      initialGeneralNotes={initialGeneralNotes}
    />
  );
}
