/**
 * @file views/notes/ui/notes-views-section.tsx
 * Notes page views container (calendar placeholder, month notes list, general notes list).
 */

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note";
import { NoteListCard } from "@/features/notes/note-list-card";
import { ListView } from "@/shared/list-view";
import type { NotesViewId } from "@/shared/view-switcher";
import { getReservedMeta } from "@/views/notes/lib/reserved-meta";

export interface NotesViewsSectionProps {
  month: string;
  view: NotesViewId;
  initialCalendarNotes: CalendarNotesResponse;
  initialGeneralNotes: GeneralNotesResponse;
}

export function NotesViewsSection({
  month,
  view,
  initialCalendarNotes,
  initialGeneralNotes,
}: NotesViewsSectionProps) {
  const sectionClassName =
    view === "calendar"
      ? "rounded-2xl border border-dashed border-[var(--color-border)] p-4"
      : "";

  return (
    <section className={sectionClassName}>
      {view === "calendar" ? (
        <p className="text-body-muted">
          Calendar for {month}: {initialCalendarNotes.calendarDays.length} days,{" "}
          {initialCalendarNotes.monthNotes.length} notes. Calendar grid arrives in
          Step 4b.
        </p>
      ) : null}

      {view === "month-notes" ? (
        <ListView
          items={initialCalendarNotes.monthNotes}
          getKey={(note) => note.id}
          renderItem={(note) => {
            const reserved = getReservedMeta("month-notes", note);

            return (
              <NoteListCard
                note={note}
                reserved={reserved.value}
                reservedKind={reserved.kind}
              />
            );
          }}
        />
      ) : null}

      {view === "general-notes" ? (
        <ListView
          items={initialGeneralNotes.generalNotes}
          getKey={(note) => note.id}
          renderItem={(note) => {
            const reserved = getReservedMeta("general-notes", note);

            return (
              <NoteListCard
                note={note}
                reserved={reserved.value}
                reservedKind={reserved.kind}
              />
            );
          }}
        />
      ) : null}
    </section>
  );
}
