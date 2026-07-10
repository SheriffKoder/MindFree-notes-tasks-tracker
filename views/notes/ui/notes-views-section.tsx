/**
 * @file views/notes/ui/notes-views-section.tsx
 * Notes page views container (calendar placeholder, month notes list, general notes list).
 */

import { useCallback, useMemo } from "react";

import type {
  Note,
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

/**
 * Stable key extractor for list rows — module-level so referential identity never changes.
 */
function getNoteKey(note: Note): string {
  return note.id;
}

export function NotesViewsSection({
  month,
  view,
  initialCalendarNotes,
  initialGeneralNotes,
}: NotesViewsSectionProps) {
  
  // Stable config object for CardGridMobile → WeekOrganizer (avoids regroup on parent re-render).
  const monthNotesWeekGrouping = useMemo(
    () => ({ month, dateKey: "date" as const, defaultOpen: true }),
    [month],
  );

  // Stable renderItem refs let memoized NoteListCard skip re-renders when note data is unchanged.
  const renderMonthNote = useCallback((note: Note) => {
    const reserved = getReservedMeta("month-notes", note);

    return (
      <NoteListCard
        note={note}
        reserved={reserved.value}
        reservedKind={reserved.kind}
      />
    );
  }, []);

  // Stable renderItem refs let memoized NoteListCard skip re-renders when note data is unchanged.
  const renderGeneralNote = useCallback((note: Note) => {
    const reserved = getReservedMeta("general-notes", note);

    return (
      <NoteListCard
        note={note}
        reserved={reserved.value}
        reservedKind={reserved.kind}
      />
    );
  }, []);

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
          getKey={getNoteKey}
          weekGrouping={monthNotesWeekGrouping}
          renderItem={renderMonthNote}
        />
      ) : null}

      {/* Only one list branch mounts at a time — inactive views unmount entirely. */}
      {view === "general-notes" ? (
        <ListView
          items={initialGeneralNotes.generalNotes}
          getKey={getNoteKey}
          renderItem={renderGeneralNote}
        />
      ) : null}
    </section>
  );
}
