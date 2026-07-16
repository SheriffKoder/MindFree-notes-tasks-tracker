/**
 * @file entities/activity/editor/fields/activity-form-title-actions.tsx
 * Archive / restore / delete controls for the activity title row.
 *
 * Purpose: Dumb action buttons — orchestrator (Step 13) owns persistence.
 * Used in: entities/activity/editor/fields/activity-form-title-row.tsx
 */

import { Archive, ArchiveRestore, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ActivityFormTitleActionsProps {
  /** When true, shows Restore instead of Archive. */
  isArchived?: boolean;
  /** Soft-archive the persisted activity. */
  onArchive?: () => void;
  /** Clear `archivedAt` on the persisted activity. */
  onRestore?: () => void;
  /** Hard-delete the persisted activity (+ records via Step 12 hub). */
  onDelete?: () => void;
}

/**
 * Renders archive/restore and delete icon buttons beside the title field.
 */
export function ActivityFormTitleActions({
  isArchived = false,
  onArchive,
  onRestore,
  onDelete,
}: ActivityFormTitleActionsProps) {
  const showArchive = !isArchived && Boolean(onArchive);
  const showRestore = isArchived && Boolean(onRestore);
  const showDelete = Boolean(onDelete);

  if (!showArchive && !showRestore && !showDelete) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {showArchive ? (
        <Button
          aria-label="Archive task"
          className="shrink-0 [color:var(--color-fg-muted)] hover:[color:var(--color-fg)]"
          size="icon"
          title="Archive"
          type="button"
          variant="ghost"
          onClick={onArchive}
        >
          <Archive className="h-4 w-4" />
        </Button>
      ) : null}

      {showRestore ? (
        <Button
          aria-label="Restore task"
          className="shrink-0 [color:var(--color-fg-muted)] hover:[color:var(--color-fg)]"
          size="icon"
          title="Restore"
          type="button"
          variant="ghost"
          onClick={onRestore}
        >
          <ArchiveRestore className="h-4 w-4" />
        </Button>
      ) : null}

      {showDelete ? (
        <Button
          aria-label="Delete task"
          className="shrink-0 [color:var(--color-fg-muted)] hover:[color:var(--color-error)]"
          size="icon"
          title="Delete"
          type="button"
          variant="ghost"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
