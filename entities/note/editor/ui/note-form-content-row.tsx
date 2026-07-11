/**
 * @file entities/note/editor/ui/note-form-content-row.tsx
 * Row 2 — scrollable plain description with bottom-right last-saved label.
 */

import {
  PLAIN_CONTENT_CLASS,
  PLAIN_CONTENT_OVERLAY_CLASS,
} from "@/entities/note/editor/lib/note-form-classes";
import type { NoteSaveStatus } from "@/entities/note/editor/model/types";
import { NoteFormLastSaved } from "@/entities/note/editor/ui/note-form-last-saved";

export interface NoteFormContentRowProps {
  content: string;
  contentError?: string;
  formattedLastEditedAt: string | null;
  saveStatus?: NoteSaveStatus;
  showLastSaved?: boolean;
  onContentChange: (content: string) => void;
}

/**
 * Description row with internal scroll and an overlaid last-saved label.
 */
export function NoteFormContentRow({
  content,
  contentError,
  formattedLastEditedAt,
  saveStatus = "idle",
  showLastSaved = true,
  onContentChange,
}: NoteFormContentRowProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1">
      <div
        className={
          showLastSaved
            ? "relative flex min-h-0 flex-1 flex-col"
            : "flex min-h-0 flex-1 flex-col"
        }
      >
        <textarea
          aria-invalid={Boolean(contentError)}
          className={
            showLastSaved ? PLAIN_CONTENT_OVERLAY_CLASS : PLAIN_CONTENT_CLASS
          }
          name="content"
          placeholder="Write your note…"
          rows={12}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
        />

        {showLastSaved ? (
          <NoteFormLastSaved
            formattedLastEditedAt={formattedLastEditedAt}
            saveStatus={saveStatus}
          />
        ) : null}
      </div>

      {contentError ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {contentError}
        </p>
      ) : null}
    </div>
  );
}
