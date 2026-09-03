/**
 * @file views/home/ui/home-notes-strip.tsx
 * Horizontal quick-note + starred carousel for one Home category strip.
 */

"use client";

import { memo, useCallback, useMemo, type ReactNode } from "react";

import { DragHorizontalScroll } from "@/components/drag-horizontal/drag-horizontal-scroll";
import type { HomeNotesStrip as HomeNotesStripModel, Note } from "@/entities/note/client";
import { NoteListCard } from "@/features/notes/note-list-card";
import { cn } from "@/lib/utils";
import { getReservedMeta } from "@/views/notes/lib/reserved-meta";

const HOME_STRIP_CARD_SHELL_CLASS =
  "w-[min(220px,30vw)] shrink-0 md:w-[min(280px,70vw)]";

export interface HomeNotesStripProps {
  strip: HomeNotesStripModel;
  isTwoRows?: boolean;
  onNoteClick: (note: Note) => void;
  onQuickPlaceholderClick: (categoryId: string) => void;
}

interface HomeStripNoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
}

const HomeStripNoteCard = memo(function HomeStripNoteCard({
  note,
  onNoteClick,
}: HomeStripNoteCardProps) {
  const reserved = getReservedMeta("home", note);

  return (
    <div className={HOME_STRIP_CARD_SHELL_CLASS}>
      <NoteListCard
        note={note}
        reserved={reserved.value}
        reservedKind={reserved.kind}
        variant="home"
        onClick={() => onNoteClick(note)}
      />
    </div>
  );
});

interface HomeStripQuickSlotProps {
  quickNote: Note | null;
  categoryId: string;
  categoryName: string;
  onNoteClick: (note: Note) => void;
  onQuickPlaceholderClick: (categoryId: string) => void;
}

const HomeStripQuickSlot = memo(function HomeStripQuickSlot({
  quickNote,
  categoryId,
  categoryName,
  onNoteClick,
  onQuickPlaceholderClick,
}: HomeStripQuickSlotProps) {
  const quickReserved = quickNote ? getReservedMeta("home", quickNote) : null;

  return (
    <div className={HOME_STRIP_CARD_SHELL_CLASS}>
      {quickNote ? (
        <NoteListCard
          note={quickNote}
          reserved={quickReserved?.value}
          reservedKind={quickReserved?.kind}
          variant="home"
          onClick={() => onNoteClick(quickNote)}
        />
      ) : (
        <button
          aria-label={`Create quick note in ${categoryName}`}
          className="group flex h-40 w-full cursor-pointer flex-col text-left md:h-56"
          title={`Create quick note in ${categoryName}`}
          type="button"
          onClick={() => onQuickPlaceholderClick(categoryId)}
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
  );
});

function HomeStripRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-row gap-3", className)}>{children}</div>;
}

export const HomeNotesStrip = memo(function HomeNotesStrip({
  strip,
  isTwoRows = false,
  onNoteClick,
  onQuickPlaceholderClick,
}: HomeNotesStripProps) {
  const renderStarredNote = useCallback(
    (note: Note) => (
      <HomeStripNoteCard key={note.id} note={note} onNoteClick={onNoteClick} />
    ),
    [onNoteClick],
  );

  const quickSlot = useMemo(
    () => (
      <HomeStripQuickSlot
        key="quick"
        categoryId={strip.categoryId}
        categoryName={strip.categoryName}
        quickNote={strip.quickNote}
        onNoteClick={onNoteClick}
        onQuickPlaceholderClick={onQuickPlaceholderClick}
      />
    ),
    [
      onNoteClick,
      onQuickPlaceholderClick,
      strip.categoryId,
      strip.categoryName,
      strip.quickNote,
    ],
  );

  const rows = useMemo(() => {
    const starredCards = strip.starredNotes.map(renderStarredNote);

    if (!isTwoRows) {
      return { row1: [quickSlot, ...starredCards], row2: [] as ReactNode[] };
    }

    const allCards = [quickSlot, ...starredCards];
    const splitAt = Math.ceil(allCards.length / 2);

    return {
      row1: allCards.slice(0, splitAt),
      row2: allCards.slice(splitAt),
    };
  }, [isTwoRows, quickSlot, renderStarredNote, strip.starredNotes]);

  return (
    <div className="relative -mx-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--color-bg)] to-transparent"
      />
      <DragHorizontalScroll
        className="px-1 pb-1"
        id={`home-starred-notes-strip-${strip.categoryId}`}
      >
        {isTwoRows ? (
          <div className="flex w-max flex-col gap-3">
            <HomeStripRow>{rows.row1}</HomeStripRow>
            {rows.row2.length > 0 ? (
              <HomeStripRow>{rows.row2}</HomeStripRow>
            ) : null}
          </div>
        ) : (
          <HomeStripRow>{rows.row1}</HomeStripRow>
        )}
      </DragHorizontalScroll>
    </div>
  );
});
