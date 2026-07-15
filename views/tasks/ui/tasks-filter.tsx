/**
 * @file views/tasks/ui/tasks-filter.tsx
 * Task-selection filter for the Tasks calendar (dropdown + reset).
 *
 * Purpose: choose which tasks' records render on the calendar. Unchecking a task
 * hides its records; "Show all" resets. Reads/writes selection via
 * useTasksFilter — the activity list is unaffected (tasks-page.md).
 * Used in: views/tasks/ui/tasks-client.tsx
 */

"use client";

import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Activity } from "@/entities/activity/client";
import { cn } from "@/lib/utils";
import { useTasksFilter } from "@/views/tasks/model/tasks-filter-context";

export interface TasksFilterProps {
  /** Tasks available to filter (from the definitions cache). */
  tasks: readonly Activity[];
  className?: string;
}

/**
 * Renders a task multi-select beside the toolbar. The trigger reflects an
 * active filter via the `secondary` variant.
 */
export function TasksFilter({ tasks, className }: TasksFilterProps) {
  const { isShown, isFiltered, toggle, reset } = useTasksFilter();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Filter calendar by task"
            className="shrink-0"
            size="icon"
            title="Filter calendar by task"
            type="button"
            variant={isFiltered ? "secondary" : "ghost"}
          >
            <Filter
              aria-hidden
              className="h-4 w-4 [color:var(--color-fg-muted)]"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Show tasks</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tasks.length === 0 ? (
            <DropdownMenuItem disabled>No tasks yet</DropdownMenuItem>
          ) : (
            tasks.map((task) => (
              <DropdownMenuCheckboxItem
                key={task.id}
                checked={isShown(task.id)}
                onCheckedChange={() => toggle(task.id)}
                onSelect={(event) => event.preventDefault()}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {task.color ? (
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: task.color }}
                    />
                  ) : null}
                  <span className="truncate">{task.title}</span>
                </span>
              </DropdownMenuCheckboxItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!isFiltered}
            onSelect={(event) => {
              event.preventDefault();
              reset();
            }}
          >
            Show all
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
