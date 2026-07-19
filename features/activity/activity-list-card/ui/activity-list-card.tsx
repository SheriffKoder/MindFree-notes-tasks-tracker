/**
 * @file features/activity/activity-list-card/ui/activity-list-card.tsx
 * Presentational task/reminder list card (definition metadata only).
 */

import { Bell } from "lucide-react";
import { memo } from "react";

import type { Activity, ActivityStatus, ScheduleType } from "@/entities/activity";
import { getActivityStatus } from "@/entities/activity";
import { getActivityCardInteractionProps } from "@/features/activity/activity-list-card/lib/card-interaction-props";
import { ACTIVITY_LIST_CARD_CSS_VARS } from "@/features/activity/activity-list-card/lib/card-style-config";
import { cn } from "@/lib/utils";

export interface ActivityListCardProps {
  activity: Activity;
  /** Reference day for the status chip (`YYYY-MM-DD`). */
  todayIso: string;
  onClick?: () => void;
}

const STATUS_LABELS: Record<ActivityStatus, string> = {
  active: "Active",
  upcoming: "Upcoming",
  expired: "Expired",
  archived: "Archived",
};

const SCHEDULE_LABELS: Record<ScheduleType, string> = {
  once: "Once",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

/** Skips re-render when `activity`, `todayIso`, and `onClick` are referentially equal. */
export const ActivityListCard = memo(function ActivityListCard({
  activity,
  todayIso,
  onClick,
}: ActivityListCardProps) {
  const status = getActivityStatus(activity, todayIso);
  const isReminder = activity.kind === "reminder";
  // Reminders stay theme-neutral — no task-color accent dot.
  const colorAccent =
    !isReminder && activity.color !== null ? activity.color : null;

  return (
    <article
      style={ACTIVITY_LIST_CARD_CSS_VARS}
      className={cn(
        "flex min-h-28 flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--activity-card-bg-default)] p-4 transition-colors duration-200",
        onClick &&
          "cursor-pointer hover:border-[color-mix(in_srgb,var(--color-accent)_30%,var(--color-border))] hover:bg-[var(--activity-card-hover-light)] dark:hover:bg-[var(--activity-card-hover-dark)]",
      )}
      {...getActivityCardInteractionProps(onClick)}
    >
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-2">
          {isReminder ? (
            // Icons sit before the title. Bell is the placeholder while
            // `activity.icon` is null / unmapped.
            <Bell
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0 [color:var(--activity-card-muted)]"
            />
          ) : colorAccent ? (
            <span
              aria-hidden
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: colorAccent }}
            />
          ) : null}
          <p className="line-clamp-2 min-w-0 flex-1 text-sm font-medium [color:var(--activity-card-title)]">
            {activity.title}
          </p>
        </div>
        {activity.description ? (
          <p
            className={cn(
              "mt-1.5 line-clamp-2 text-caption [color:var(--activity-card-muted)]",
              isReminder && "pl-6",
              colorAccent && "pl-[18px]",
            )}
          >
            {activity.description}
          </p>
        ) : null}
      </div>

      <p className="mt-4 ml-auto text-[11px] leading-tight [color:var(--activity-card-muted)]">
        {SCHEDULE_LABELS[activity.scheduleType]} · {STATUS_LABELS[status]}
      </p>
    </article>
  );
});
