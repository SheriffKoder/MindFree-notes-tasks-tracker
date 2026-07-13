/**
 * @file features/notes/note-list-card/ui/note-list-card.tsx
 * Responsive note list card (mobile + desktop variants).
 */

import { memo } from "react";

import type { Note } from "@/entities/note";
import { NoteListCardDesktop } from "@/features/notes/note-list-card/ui/note-list-card-desktop";
import { NoteListCardMobile } from "@/features/notes/note-list-card/ui/note-list-card-mobile";

export interface NoteListCardProps {
  note: Note;
  reserved?: string;
  reservedKind?: "date" | "file";
  /** Opens the note drawer when the card is clicked. */
  onClick?: () => void;
  /**
   * Card chrome variant.
   * - `responsive` — mobile card below `md`, desktop card at `md+` (default)
   * - `mobile` / `desktop` — force one variant at all breakpoints
   */
  variant?: "responsive" | "mobile" | "desktop";
}

function formatLastEditedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Edited recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Skips re-render when `note`, `reserved`, and `reservedKind` are referentially equal. */
export const NoteListCard = memo(function NoteListCard({
  note,
  reserved,
  reservedKind,
  onClick,
  variant = "responsive",
}: NoteListCardProps) {
  const formattedLastEditedAt = formatLastEditedAt(note.lastEditedAt);

  if (variant === "mobile") {
    return (
      <NoteListCardMobile
        note={note}
        reserved={reserved}
        reservedKind={reservedKind}
        formattedLastEditedAt={formattedLastEditedAt}
        onClick={onClick}
      />
    );
  }

  if (variant === "desktop") {
    return (
      <NoteListCardDesktop
        note={note}
        reserved={reserved}
        reservedKind={reservedKind}
        formattedLastEditedAt={formattedLastEditedAt}
        onClick={onClick}
      />
    );
  }

  return (
    <>
      <div className="md:hidden">
        <NoteListCardMobile
          note={note}
          reserved={reserved}
          reservedKind={reservedKind}
          formattedLastEditedAt={formattedLastEditedAt}
          onClick={onClick}
        />
      </div>
      <div className="hidden md:block">
        <NoteListCardDesktop
          note={note}
          reserved={reserved}
          reservedKind={reservedKind}
          formattedLastEditedAt={formattedLastEditedAt}
          onClick={onClick}
        />
      </div>
    </>
  );
});
