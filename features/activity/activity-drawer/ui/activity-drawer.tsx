/**
 * @file features/activity/activity-drawer/ui/activity-drawer.tsx
 * Tasks config drawer — shell, form, footer, and edit-mode cache resolution.
 *
 * Purpose: Compose ActivityForm + last-saved footer inside AppDrawer; resolve
 * the edit target from the already-loaded `["activities", "task"]` cache via
 * a one-line `.find()`.
 * Used in: views/tasks/ui/tasks-client.tsx
 * Used for: Create draft / edit existing task without asking for kind.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import {
  ActivityForm,
  type ActivityFormFooterMeta,
} from "@/entities/activity/editor";
import { useActivitiesQuery } from "@/entities/activity/client";
import { ActivityDrawerFooter } from "@/features/activity/activity-drawer/ui/activity-drawer-footer";
import { AppDrawer } from "@/shared/drawer";
import type { UseTasksDrawerResult } from "@/views/tasks/model/use-tasks-drawer";

export interface ActivityDrawerProps {
  /** Page-level drawer open/close state and editor request. */
  drawer: UseTasksDrawerResult;
  /** Clears page selection when the drawer is dismissed. */
  onDismiss?: () => void;
}

const INITIAL_FOOTER_META: ActivityFormFooterMeta = {
  formattedLastEditedAt: null,
  saveStatus: "idle",
};

/**
 * Composes the activity config form inside `AppDrawer`.
 *
 * Edit-mode resolution is a single cache lookup — Activity has one definitions
 * bucket per kind, unlike Notes' calendar/general split.
 * Archive/restore/delete callbacks land in Step 13's orchestrator.
 */
export function ActivityDrawer({ drawer, onDismiss }: ActivityDrawerProps) {
  const { isOpen, request, setOpen } = drawer;
  const { data } = useActivitiesQuery("task");
  const activities = data?.activities ?? [];
  const [footerMeta, setFooterMeta] =
    useState<ActivityFormFooterMeta>(INITIAL_FOOTER_META);

  const activity = useMemo(() => {
    if (request?.mode !== "edit") {
      return null;
    }

    return activities.find((row) => row.id === request.activityId) ?? null;
  }, [activities, request]);

  const resetKey = useMemo(() => {
    if (request?.mode === "edit") {
      return `edit:${request.activityId}`;
    }

    if (request?.mode === "create") {
      return "create-draft";
    }

    return "draft";
  }, [request]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onDismiss?.();
      }

      setOpen(open);
    },
    [onDismiss, setOpen],
  );

  const handleFooterMetaChange = useCallback((meta: ActivityFormFooterMeta) => {
    setFooterMeta(meta);
  }, []);

  return (
    <AppDrawer
      ariaLabel="Task editor"
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <div className="flex min-h-full flex-col">
        <ActivityForm
          activity={activity}
          resetKey={resetKey}
          onFooterMetaChange={handleFooterMetaChange}
        />

        <ActivityDrawerFooter
          formattedLastEditedAt={footerMeta.formattedLastEditedAt}
          saveStatus={footerMeta.saveStatus}
        />
      </div>
    </AppDrawer>
  );
}
