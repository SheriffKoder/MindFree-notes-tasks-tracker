/**
 * @file features/notes/note-list-card/ui/note-list-card-mobile.tsx
 * Mobile list card (bottom border only).
 */

import { CalendarDays, FileText } from "lucide-react";
import type { Note } from "@/entities/note";
import { getNoteCardInteractionProps } from "@/features/notes/note-list-card/lib/card-interaction-props";
import { NOTE_LIST_CARD_CSS_VARS } from "@/features/notes/note-list-card/lib/card-style-config";
import { NoteListCardStatusIcons } from "@/features/notes/note-list-card/ui/note-list-card-status-icons";

export interface NoteListCardMobileProps {
  note: Note;
  reserved?: string;
  reservedKind?: "date" | "file";
  onClick?: () => void;
}

export function NoteListCardMobile({
  note,
  reserved,
  reservedKind,
  onClick,
}: NoteListCardMobileProps) {
  const reservedClass = note.isImportant
    ? "text-caption [color:var(--note-card-important-accent)]"
    : "text-caption [color:var(--note-card-reserved)]";

  return (
    <article
      style={NOTE_LIST_CARD_CSS_VARS}
      className="relative flex h-40 cursor-pointer flex-col justify-between rounded-xl border-b border-[var(--color-border)] bg-[var(--note-card-bg-default)] px-4 py-3 transition-colors duration-200 hover:bg-[var(--note-card-hover-light)] dark:hover:bg-[var(--note-card-hover-dark)]"
      {...getNoteCardInteractionProps(onClick)}
    >
      <div>
        <p className="line-clamp-2 text-sm font-medium">{note.content || "(empty note)"}</p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className={reservedClass}>
          {reserved ? (
            <span className="inline-flex items-center gap-1">
              {reservedKind === "date" ? (
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <FileText className="h-3.5 w-3.5" aria-hidden />
              )}
              <span>{reserved}</span>
            </span>
          ) : (
            ""
          )}
        </p>
        <NoteListCardStatusIcons layout="inline" note={note} />
      </div>
    </article>
  );
}
