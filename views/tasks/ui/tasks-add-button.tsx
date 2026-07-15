/**
 * @file views/tasks/ui/tasks-add-button.tsx
 * Icon-only control that opens the config drawer for a new task.
 *
 * Purpose: Primary create entry on the Tasks page toolbar.
 * Used in: views/tasks/ui/tasks-client.tsx
 * Used for: Lazy task create — drawer opens (Step 11); the row is created on save.
 */

"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TasksAddButtonProps {
  /** Opens the drawer in task-create mode. */
  onClick: () => void;
  className?: string;
}

/**
 * Renders a compact "+" button beside the view switcher.
 * Chrome matches the view switcher — bordered surface pill, ghost icon.
 */
export function TasksAddButton({ onClick, className }: TasksAddButtonProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
    >
      <Button
        aria-label="Add task"
        className="shrink-0"
        size="icon"
        title="Add task"
        type="button"
        variant="ghost"
        onClick={onClick}
      >
        <Plus aria-hidden className="h-4 w-4 [color:var(--color-fg-muted)]" />
      </Button>
    </div>
  );
}
