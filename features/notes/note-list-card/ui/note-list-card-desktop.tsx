/**
 * @file features/notes/note-list-card/ui/note-list-card-desktop.tsx
 * Desktop list card (bordered body + overlay timestamp).
 */

import { CalendarDays, FileText } from "lucide-react";
import type { Note } from "@/entities/note";
import { getNoteCardInteractionProps } from "@/features/notes/note-list-card/lib/card-interaction-props";
import { NOTE_LIST_CARD_CSS_VARS } from "@/features/notes/note-list-card/lib/card-style-config";
import { NoteListCardStatusIcons } from "@/features/notes/note-list-card/ui/note-list-card-status-icons";

export interface NoteListCardDesktopProps {
  note: Note;
  reserved?: string;
  reservedKind?: "date" | "file";
  formattedLastEditedAt: string;
  /** Home strip layout — no timestamp overlay; icons sit bottom-right. */
  homeLayout?: boolean;
  /** Shorter card body on small screens (Home strip). */
  compactOnMobile?: boolean;
  onClick?: () => void;
}

export function NoteListCardDesktop({
  note,
  reserved,
  reservedKind,
  formattedLastEditedAt,
  homeLayout = false,
  compactOnMobile = false,
  onClick,
}: NoteListCardDesktopProps) {
  const reservedClass = note.isImportant
    ? "text-caption [color:var(--note-card-important-accent)]"
    : "text-caption [color:var(--note-card-reserved)]";

  const lastEditedClass = "text-caption [color:var(--color-fg-muted)]";

  return (
    <article
      style={NOTE_LIST_CARD_CSS_VARS}
      className={
        compactOnMobile
          ? "group flex h-40 cursor-pointer flex-col md:h-56"
          : "group flex h-56 cursor-pointer flex-col"
      }
      {...getNoteCardInteractionProps(onClick)}
    >
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--note-card-bg-default)] p-3 transition-colors duration-200 group-hover:border-[color-mix(in_srgb,var(--color-accent)_30%,var(--color-border))] group-hover:bg-[var(--note-card-hover-light)] dark:group-hover:bg-[var(--note-card-hover-dark)]">
        <NoteListCardStatusIcons
          className={homeLayout ? "bottom-2 right-2" : "right-2 top-2"}
          note={note}
        />
        <p
          className={
            homeLayout || note.isQuick
              ? "line-clamp-5 text-sm font-medium"
              : "line-clamp-5 pr-10 text-sm font-medium"
          }
        >
          {note.content || "(empty note)"}
        </p>
        {!homeLayout ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-surface)] to-transparent px-3 pb-2 pt-6 text-right">
            <p className={lastEditedClass}>{formattedLastEditedAt}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-1 h-5 pl-2">
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
      </div>
    </article>
  );
}
