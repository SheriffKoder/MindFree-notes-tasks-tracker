/**
 * @file features/notes/note-list-card/ui/note-list-card-mobile.tsx
 * Mobile list card (bottom border only).
 */

import { CalendarDays, FileText, Star } from "lucide-react";
import type { Note } from "@/entities/note";
import { NOTE_LIST_CARD_CSS_VARS } from "@/features/notes/note-list-card/lib/card-style-config";

export interface NoteListCardMobileProps {
  note: Note;
  reserved?: string;
  reservedKind?: "date" | "file";
  formattedLastEditedAt: string;
}

export function NoteListCardMobile({
  note,
  reserved,
  reservedKind,
  formattedLastEditedAt,
}: NoteListCardMobileProps) {
  const reservedClass = note.isImportant
    ? "text-caption [color:var(--note-card-important-accent)]"
    : "text-caption [color:var(--note-card-reserved)]";
  const lastEditedClass = "text-caption [color:var(--color-fg-muted)]";

  return (
    <article
      style={NOTE_LIST_CARD_CSS_VARS}
      className="relative flex h-40 cursor-pointer flex-col justify-between rounded-xl border-b border-[var(--color-border)] bg-[var(--note-card-bg-default)] px-4 py-3 transition-colors duration-200 hover:bg-[var(--note-card-hover-light)] dark:hover:bg-[var(--note-card-hover-dark)]"
    >
      {note.starred ? (
        <Star
          className="absolute right-1 top-3 h-4 w-4 [color:var(--note-card-star)]"
          fill="currentColor"
          aria-hidden
        />
      ) : null}
      <div className="pr-6">
        <p className="line-clamp-2 text-sm font-medium">{note.content || "(empty note)"}</p>
      </div>
      <div className="flex items-center justify-between gap-3">
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
        <p className={lastEditedClass}>{formattedLastEditedAt}</p>
      </div>
    </article>
  );
}
