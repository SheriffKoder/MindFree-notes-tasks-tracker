/**
 * @file features/activity/activity-record-drawer/ui/activity-record-task-picker.tsx
 * Add-definition dropdown for the selected-day records drawer.
 *
 * Lists definitions not yet recorded for the day, with archived items in a
 * separate section. Selecting one creates a zero-value record for that day.
 *
 * Candidate ownership stays in `ActivityRecordList`, which has both canonical
 * query inputs. This component only presents those candidates and performs the
 * selected definition's record mutation.
 */

"use client";

import { Plus } from "lucide-react";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Activity,
  ActivityKind,
  RecordTaskCandidates,
} from "@/entities/activity";
import { useUpsertActivityRecordMutation } from "@/entities/activity/client";

export interface ActivityRecordTaskPickerProps {
  /** Selected calendar day (`YYYY-MM-DD`). */
  date: string;
  /** Definition kind owned by the mounting page. */
  kind: ActivityKind;
  /** Definitions eligible to add, already split active vs archived. */
  candidates: RecordTaskCandidates;
}

/**
 * Renders an Add trigger that opens a definition picker and creates a day record.
 */
export function ActivityRecordTaskPicker({
  date,
  kind,
  candidates,
}: ActivityRecordTaskPickerProps) {
  // The mutation optimistically inserts into `["activityRecords", month]`.
  // ActivityRecordList subscribes to that cache, so the selected definition
  // leaves this dropdown and appears as a card without local picker state.
  const { mutate: upsertRecord, isPending } = useUpsertActivityRecordMutation();
  const hasCandidates =
    candidates.active.length > 0 || candidates.archived.length > 0;

  const copy = useMemo(() => {
    const singular = kind === "task" ? "task" : "reminder";
    const plural = kind === "task" ? "Tasks" : "Reminders";

    return {
      addLabel: `Add ${singular} record`,
      emptyLabel: `All ${singular}s added`,
      sectionLabel: plural,
    };
  }, [kind]);

  const handleSelect = useCallback(
    (activity: Activity) => {
      // A record needs an initial row before its card can be edited. Zero totals
      // create that row; snapshot fields come from the definition (form-owned).
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
          aria-label={copy.addLabel}
          className="shrink-0"
          disabled={!hasCandidates || isPending}
          size="icon"
          title={hasCandidates ? copy.addLabel : copy.emptyLabel}
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
          <DropdownMenuItem disabled>{copy.emptyLabel}</DropdownMenuItem>
        ) : (
          <>
            {candidates.active.length > 0 ? (
              <>
                <DropdownMenuLabel>{copy.sectionLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {candidates.active.map((activity) => (
                  <DefinitionMenuItem
                    key={activity.id}
                    activity={activity}
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
                {candidates.archived.map((activity) => (
                  <DefinitionMenuItem
                    key={activity.id}
                    activity={activity}
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

interface DefinitionMenuItemProps {
  activity: Activity;
  onSelect: (activity: Activity) => void;
}

function DefinitionMenuItem({ activity, onSelect }: DefinitionMenuItemProps) {
  return (
    <DropdownMenuItem
      onSelect={() => {
        onSelect(activity);
      }}
    >
      <span className="flex min-w-0 items-center gap-2">
        {activity.color ? (
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: activity.color }}
          />
        ) : null}
        <span className="truncate">{activity.title}</span>
      </span>
    </DropdownMenuItem>
  );
}
