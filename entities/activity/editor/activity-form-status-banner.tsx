/**
 * @file entities/activity/editor/activity-form-status-banner.tsx
 * Inline upcoming/expired banner for the activity config form.
 *
 * Purpose: Surface window-derived status without a separate lookup or local state.
 * Used in: entities/activity/editor/activity-form.tsx
 * Used for: "Starts {date}" / "Expired {date}" cues; silent for active/archived.
 */

import { getActivityStatus } from "@/entities/activity";
import type { Activity } from "@/entities/activity";
import type { ActivityFormValues } from "@/entities/activity/editor/model/types";
import { cn } from "@/lib/utils";
import { getTodayIsoDate } from "@/shared/calendar";

export interface ActivityFormStatusBannerProps {
  values: Pick<
    ActivityFormValues,
    "scheduleType" | "scheduleConfig" | "startsAt" | "endsAt"
  >;
  /** Persisted archive stamp; drafts pass `null`. */
  archivedAt: string | null;
}

function resolveBannerBounds(values: ActivityFormStatusBannerProps["values"]): {
  start: string | null;
  end: string | null;
} {
  if (
    values.scheduleType === "once" &&
    typeof values.scheduleConfig === "string"
  ) {
    return { start: values.scheduleConfig, end: values.scheduleConfig };
  }

  return {
    start: values.startsAt ?? null,
    end: values.endsAt ?? null,
  };
}

/** Minimal activity for `getActivityStatus` — only window/archive fields matter. */
function toStatusActivity(
  values: ActivityFormStatusBannerProps["values"],
  archivedAt: string | null,
): Activity {
  return {
    id: "draft",
    kind: "task",
    title: "",
    description: null,
    color: null,
    trackingMode: "boolean",
    goal: null,
    goalDuration: null,
    goalPeriod: null,
    periodGoal: null,
    periodGoalDuration: null,
    priority: null,
    icon: null,
    createdAt: "",
    updatedAt: "",
    scheduleType: values.scheduleType,
    scheduleConfig: values.scheduleConfig,
    startsAt: values.startsAt ?? null,
    endsAt: values.endsAt ?? null,
    archivedAt,
  };
}

/**
 * Renders an informational banner for upcoming/expired only.
 */
export function ActivityFormStatusBanner({
  values,
  archivedAt,
}: ActivityFormStatusBannerProps) {
  const todayIso = getTodayIsoDate();
  const status = getActivityStatus(toStatusActivity(values, archivedAt), todayIso);

  if (status !== "upcoming" && status !== "expired") {
    return null;
  }

  const { start, end } = resolveBannerBounds(values);
  const label =
    status === "upcoming"
      ? start
        ? `Starts ${start}`
        : null
      : end
        ? `Expired ${end}`
        : null;

  if (!label) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-caption",
        status === "upcoming"
          ? "border-[var(--color-border)] [background-color:color-mix(in_srgb,var(--color-surface-secondary)_80%,transparent)] [color:var(--color-fg-muted)]"
          : "border-[color-mix(in_srgb,var(--color-error)_25%,var(--color-border))] [background-color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] [color:var(--color-error)]",
      )}
      role="status"
    >
      {label}
    </p>
  );
}
