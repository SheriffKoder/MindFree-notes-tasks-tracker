/**
 * @file features/activity/activity-record-drawer/ui/activity-record-task-picker.tsx
 * Add-task dropdown for the selected-day records drawer.
 *
 * Lists tasks not yet recorded for the day, with archived tasks in a separate
 * section. Selecting a task creates a zero-value record for that day.
 *
 * Candidate ownership stays in `ActivityRecordList`, which has both canonical
 * query inputs. This component only presents those candidates and performs the
 * selected task's record mutation.
 */

"use client";

import { Plus } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Activity, RecordTaskCandidates } from "@/entities/activity";
import { useUpsertActivityRecordMutation } from "@/entities/activity/client";

export interface ActivityRecordTaskPickerProps {
  /** Selected calendar day (`YYYY-MM-DD`). */
  date: string;
  /** Tasks eligible to add, already split active vs archived. */
  candidates: RecordTaskCandidates;
}

/**
 * Renders an Add trigger that opens a task picker and creates a day record.
 */
export function ActivityRecordTaskPicker({
  date,
  candidates,
}: ActivityRecordTaskPickerProps) {
  // The mutation optimistically inserts into `["activityRecords", month]`.
  // ActivityRecordList subscribes to that cache, so the selected task leaves
  // this dropdown and appears as a card without local picker state.
  const { mutate: upsertRecord, isPending } = useUpsertActivityRecordMutation();
  const hasCandidates =
    candidates.active.length > 0 || candidates.archived.length > 0;

  const handleSelect = useCallback(
    (activity: Activity) => {
      // A record needs an initial row before its card can be edited. Zero totals
      // intentionally create that row; PostgreSQL fills its configuration
      // snapshots from this task on first insert.
      upsertRecord({
        taskId: activity.id,
        date,
        count: 0,
        duration: 0,
        description: null,
        trackingMode: activity.trackingMode,
        goal: activity.goal,
        goalDuration: activity.goalDuration,
      });
    },
    [date, upsertRecord],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Add task record"
          className="shrink-0"
          disabled={!hasCandidates || isPending}
          size="icon"
          title={hasCandidates ? "Add task record" : "All tasks added"}
          type="button"
          variant="ghost"
        >
          <Plus
            aria-hidden
            className="h-4 w-4 [color:var(--color-fg-muted)]"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[70] w-56"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {!hasCandidates ? (
          <DropdownMenuItem disabled>All tasks added</DropdownMenuItem>
        ) : (
          <>
            {candidates.active.length > 0 ? (
              <>
                <DropdownMenuLabel>Tasks</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {candidates.active.map((task) => (
                  <TaskMenuItem
                    key={task.id}
                    task={task}
                    onSelect={handleSelect}
                  />
                ))}
              </>
            ) : null}

            {candidates.active.length > 0 && candidates.archived.length > 0 ? (
              <DropdownMenuSeparator />
            ) : null}

            {candidates.archived.length > 0 ? (
              <>
                <DropdownMenuLabel>Archived</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {candidates.archived.map((task) => (
                  <TaskMenuItem
                    key={task.id}
                    task={task}
                    onSelect={handleSelect}
                  />
                ))}
              </>
            ) : null}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface TaskMenuItemProps {
  task: Activity;
  onSelect: (task: Activity) => void;
}

function TaskMenuItem({ task, onSelect }: TaskMenuItemProps) {
  return (
    <DropdownMenuItem
      onSelect={() => {
        onSelect(task);
      }}
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
    </DropdownMenuItem>
  );
}
