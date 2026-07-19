/**
 * @file features/activity/activity-drawer/ui/activity-drawer.tsx
 * Activity config drawer — shell, form, footer, and edit-mode cache resolution.
 *
 * Purpose: Compose ActivityForm + last-saved footer inside AppDrawer; resolve
 * the edit target from the already-loaded kind-specific activity cache via
 * a one-line `.find()`. Autosave / archive / delete live in the config
 * orchestrator (Step 13).
 * Used in: views/tasks/ui/tasks-client.tsx
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import {
  ActivityForm,
  type ActivityFormFooterMeta,
} from "@/entities/activity/editor";
import { useActivitiesQuery } from "@/entities/activity/client";
import type { ActivityKind } from "@/entities/activity/model/types";
import type { ActivityDrawerController } from "@/features/activity/activity-drawer/model/types";
import { useConfigOrchestrator } from "@/features/activity/activity-drawer/model/use-config-orchestrator";
import { ActivityDrawerFooter } from "@/features/activity/activity-drawer/ui/activity-drawer-footer";
import { AppDrawer } from "@/shared/drawer";

export interface ActivityDrawerProps {
  /** Definition kind owned by the mounting page. */
  kind: ActivityKind;
  /** Page-level drawer open/close state and editor request. */
  drawer: ActivityDrawerController;
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
 */
export function ActivityDrawer({
  drawer,
  kind,
  onDismiss,
}: ActivityDrawerProps) {
  const { isOpen, request, setOpen, openEdit } = drawer;
  const { data } = useActivitiesQuery(kind);
  const [footerMeta, setFooterMeta] =
    useState<ActivityFormFooterMeta>(INITIAL_FOOTER_META);

  const activity = useMemo(() => {
    if (request?.mode !== "edit") {
      return null;
    }

    return (
      data?.activities.find((row) => row.id === request.activityId) ?? null
    );
  }, [data?.activities, request]);

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

  const handleActivityCreated = useCallback(
    (activityId: string) => {
      openEdit(activityId);
    },
    [openEdit],
  );

  const handleDeleted = useCallback(() => {
    onDismiss?.();
    setOpen(false);
  }, [onDismiss, setOpen]);

  const {
    saveStatus,
    handleChange,
    commitKey,
    archive,
    restore,
    remove,
  } = useConfigOrchestrator({
    activity,
    kind,
    isOpen,
    onActivityCreated: handleActivityCreated,
    onDeleted: handleDeleted,
  });

  const handleFooterMetaChange = useCallback((meta: ActivityFormFooterMeta) => {
    setFooterMeta(meta);
  }, []);

  return (
    <AppDrawer
      ariaLabel={kind === "task" ? "Task editor" : "Reminder editor"}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <div className="flex min-h-full flex-col">
        <ActivityForm
          activity={activity}
          commitKey={commitKey}
          kind={kind}
          resetKey={resetKey}
          saveStatus={saveStatus}
          onArchive={activity?.id ? archive : undefined}
          onChange={handleChange}
          onDelete={activity?.id ? remove : undefined}
          onFooterMetaChange={handleFooterMetaChange}
          onRestore={activity?.id ? restore : undefined}
        />

        <ActivityDrawerFooter
          formattedLastEditedAt={footerMeta.formattedLastEditedAt}
          saveStatus={saveStatus}
        />
      </div>
    </AppDrawer>
  );
}
