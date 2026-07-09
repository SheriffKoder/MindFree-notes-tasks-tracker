/**
 * @file features/notes/note-list-card/ui/note-list-card.tsx
 * Responsive note list card (mobile + desktop variants).
 */

import type { Note } from "@/entities/note";
import { NoteListCardDesktop } from "@/features/notes/note-list-card/ui/note-list-card-desktop";
import { NoteListCardMobile } from "@/features/notes/note-list-card/ui/note-list-card-mobile";

export interface NoteListCardProps {
  note: Note;
  reserved?: string;
  reservedKind?: "date" | "file";
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

export function NoteListCard({ note, reserved, reservedKind }: NoteListCardProps) {
  const formattedLastEditedAt = formatLastEditedAt(note.lastEditedAt);

  return (
    <>
      <div className="md:hidden">
        <NoteListCardMobile
          note={note}
          reserved={reserved}
          reservedKind={reservedKind}
          formattedLastEditedAt={formattedLastEditedAt}
        />
      </div>
      <div className="hidden md:block">
        <NoteListCardDesktop
          note={note}
          reserved={reserved}
          reservedKind={reservedKind}
          formattedLastEditedAt={formattedLastEditedAt}
        />
      </div>
    </>
  );
}
