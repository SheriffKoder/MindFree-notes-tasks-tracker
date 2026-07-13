/**
 * @file views/home/ui/home-notes-strip.tsx
 * Horizontal quick-note + starred carousel for the Home dashboard.
 *
 * Purpose: Render home read-model cards with reserved labels.
 * Used in: views/home/ui/home-notes-section.tsx
 * Used for: Step 2 home strip — quick slot first, starred notes follow.
 */

"use client";

import { useCallback } from "react";

import { useHomeNotesQuery, type Note } from "@/entities/note/client";
import { NoteListCard } from "@/features/notes/note-list-card";
import { QueryStatePanel } from "@/shared/react-query";
import { getReservedMeta } from "@/views/notes/lib/reserved-meta";

export interface HomeNotesStripProps {
  /** Opens the drawer for an existing note. */
  onNoteClick: (note: Note) => void;
  /** Opens lazy create for the empty quick-note slot. */
  onQuickPlaceholderClick: () => void;
}

/**
 * Scrollable row of note cards — quick note (or placeholder) then starred notes.
 */
export function HomeNotesStrip({
  onNoteClick,
  onQuickPlaceholderClick,
}: HomeNotesStripProps) {
  const { data, isPending, isError, error } = useHomeNotesQuery();

  const renderStarredNote = useCallback(
    (note: Note) => {
      const reserved = getReservedMeta("home", note);

      return (
        <div
          key={note.id}
          className="w-[min(280px,70vw)] shrink-0"
        >
          <NoteListCard
            note={note}
            reserved={reserved.value}
            reservedKind={reserved.kind}
            variant="desktop"
            onClick={() => onNoteClick(note)}
          />
        </div>
      );
    },
    [onNoteClick],
  );

  if (isError) {
    return (
      <QueryStatePanel
        message={error?.message ?? "Failed to load starred notes."}
        variant="error"
      />
    );
  }

  if (isPending && !data) {
    return <QueryStatePanel message="Loading notes…" />;
  }

  const quickNote = data?.quickNote ?? null;
  const starredNotes = data?.starredNotes ?? [];
  const quickReserved = quickNote ? getReservedMeta("home", quickNote) : null;

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex flex-row gap-3">
        <div className="w-[min(280px,70vw)] shrink-0">
          {quickNote ? (
            <NoteListCard
              note={quickNote}
              reserved={quickReserved?.value}
              reservedKind={quickReserved?.kind}
              variant="desktop"
              onClick={() => onNoteClick(quickNote)}
            />
          ) : (
            <button
              aria-label="Create quick note"
              className="group flex h-56 w-full cursor-pointer flex-col text-left"
              type="button"
              onClick={onQuickPlaceholderClick}
            >
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-3 transition-colors duration-200 group-hover:border-[color-mix(in_srgb,var(--color-accent)_30%,var(--color-border))] group-hover:bg-[var(--note-card-hover-light)] dark:group-hover:bg-[var(--note-card-hover-dark)]">
                <p className="text-sm font-medium">Quick note</p>
                <p className="mt-1 text-caption text-body-muted">
                  Tap to start writing
                </p>
              </div>
              <div className="mt-1 h-5 pl-2" />
            </button>
          )}
        </div>

        {starredNotes.map(renderStarredNote)}
      </div>
    </div>
  );
}
