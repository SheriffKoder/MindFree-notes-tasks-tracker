/**
 * @file features/activity/activity-drawer/model/use-config-orchestrator.ts
 * Thin hook — refs, debounce, TanStack mutations; rules live in evaluate-activity-save.
 *
 * Purpose: Bridge dumb ActivityForm onChange events to debounced TanStack writes.
 * Used in: features/activity/activity-drawer/ui/activity-drawer.tsx
 *
 * Steps (handleChange):
 * 1. evaluate — run pure create-vs-patch pipeline.
 * 2. Gate — skip scheduling when action is noop.
 * 3. scheduleFromEvaluation — enqueue debounced create/patch mutation.
 *
 * Archive / restore / remove fire immediately and are never debounced.
 * Offline: persist via saveActivityOfflinePending and skip network mutations.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  useArchiveActivityMutation,
  useCreateActivityMutation,
  useDeleteActivityMutation,
  useRestoreActivityMutation,
  useUpdateActivityMutation,
} from "@/entities/activity/client";
import type {
  ActivityFormChangeMeta,
  ActivityFormValues,
  ActivitySaveStatus,
} from "@/entities/activity/editor/model/types";
import { pinnedDraftActivityId } from "@/entities/activity/hooks/build-optimistic-activity";
import { saveActivityOfflinePending } from "@/entities/activity/offline";
import { evaluateActivitySave } from "@/features/activity/activity-drawer/pre-save-orchestrator/evaluate-activity-save";
import type {
  EvaluateActivitySaveResult,
  UseConfigOrchestratorOptions,
  UseConfigOrchestratorResult,
} from "@/features/activity/activity-drawer/pre-save-orchestrator/types";
import { isOnline } from "@/shared/offline-queue";

const MUTATION_DEBOUNCE_MS = 600;
const SAVED_STATUS_RESET_MS = 2000;

type PendingMutation =
  | {
      kind: "create";
      values: ActivityFormValues;
    }
  | {
      kind: "patch";
      activityId: string;
      values: ActivityFormValues;
    };

/**
 * Orchestrates drawer saves via evaluateActivitySave — no business rules here.
 */
export function useConfigOrchestrator({
  activity,
  kind,
  isOpen,
  userId,
  onActivityCreated,
  onDeleted,
}: UseConfigOrchestratorOptions): UseConfigOrchestratorResult {
  const queryClient = useQueryClient();
  const { mutate: createActivity } = useCreateActivityMutation();
  const { mutate: patchActivity } = useUpdateActivityMutation();
  const { mutate: archiveActivity } = useArchiveActivityMutation();
  const { mutate: restoreActivity } = useRestoreActivityMutation();
  const { mutate: deleteActivity } = useDeleteActivityMutation();

  const [saveStatus, setSaveStatus] = useState<ActivitySaveStatus>("idle");
  const [commitKey, setCommitKey] = useState(0);

  const pendingMutationRef = useRef<PendingMutation | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityRef = useRef(activity);
  activityRef.current = activity;

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const markSaveSuccess = useCallback(() => {
    setSaveStatus("saved");
    setCommitKey((previous) => previous + 1);

    if (savedResetTimerRef.current) {
      clearTimeout(savedResetTimerRef.current);
    }

    savedResetTimerRef.current = setTimeout(() => {
      setSaveStatus("idle");
    }, SAVED_STATUS_RESET_MS);
  }, []);

  const markSaveError = useCallback(() => {
    setSaveStatus("error");
  }, []);

  const runPendingMutation = useCallback(() => {
    const pending = pendingMutationRef.current;

    if (!pending) {
      return;
    }

    pendingMutationRef.current = null;
    setSaveStatus("saving");

    // Offline — persist locally, keep optimistic cache, skip network
    if (!isOnline()) {
      if (!userId) {
        markSaveError();
        return;
      }

      switch (pending.kind) {
        case "create":
          saveActivityOfflinePending(userId, queryClient, {
            kind: "create",
            activityKind: kind,
            values: pending.values,
          });
          onActivityCreated(pinnedDraftActivityId(kind));
          markSaveSuccess();
          return;
        case "patch": {
          const current = activityRef.current;

          if (!current || current.id !== pending.activityId) {
            markSaveError();
            return;
          }

          saveActivityOfflinePending(userId, queryClient, {
            kind: "patch",
            activity: current,
            values: pending.values,
          });
          markSaveSuccess();
          return;
        }
      }
    }

    const mutationOptions = {
      onSuccess: () => {
        markSaveSuccess();
      },
      onError: () => {
        markSaveError();
      },
    };

    switch (pending.kind) {
      case "create":
        createActivity(
          { kind, values: pending.values },
          {
            onSuccess: (serverActivity) => {
              markSaveSuccess();
              onActivityCreated(serverActivity.id);
            },
            onError: () => {
              markSaveError();
            },
          },
        );
        return;
      case "patch": {
        const current = activityRef.current;

        if (!current || current.id !== pending.activityId) {
          markSaveError();
          return;
        }

        patchActivity(
          { activity: current, values: pending.values },
          mutationOptions,
        );
        return;
      }
    }
  }, [
    createActivity,
    kind,
    markSaveError,
    markSaveSuccess,
    onActivityCreated,
    patchActivity,
    queryClient,
    userId,
  ]);

  const scheduleMutation = useCallback(
    (mutation: PendingMutation) => {
      pendingMutationRef.current = mutation;
      clearDebounceTimer();
      debounceTimerRef.current = setTimeout(
        runPendingMutation,
        MUTATION_DEBOUNCE_MS,
      );
    },
    [clearDebounceTimer, runPendingMutation],
  );

  const scheduleFromEvaluation = useCallback(
    (result: EvaluateActivitySaveResult) => {
      switch (result.action) {
        case "create":
          scheduleMutation({
            kind: "create",
            values: result.payload,
          });
          return;
        case "patch": {
          const current = activityRef.current;

          if (!current?.id) {
            return;
          }

          scheduleMutation({
            kind: "patch",
            activityId: current.id,
            values: result.payload,
          });
          return;
        }
        case "noop":
          pendingMutationRef.current = null;
          clearDebounceTimer();
      }
    },
    [clearDebounceTimer, scheduleMutation],
  );

  const handleChange = useCallback(
    (values: ActivityFormValues, meta: ActivityFormChangeMeta) => {
      const result = evaluateActivitySave({
        values,
        meta,
        activity: activityRef.current,
      });

      if (result.action === "noop") {
        if (!meta.isDirty) {
          pendingMutationRef.current = null;
          clearDebounceTimer();
        }

        return;
      }

      scheduleFromEvaluation(result);
    },
    [clearDebounceTimer, scheduleFromEvaluation],
  );

  const archive = useCallback(() => {
    const current = activityRef.current;

    if (!current?.id) {
      return;
    }

    clearDebounceTimer();
    pendingMutationRef.current = null;
    setSaveStatus("saving");

    if (!isOnline()) {
      if (!userId) {
        markSaveError();
        return;
      }

      saveActivityOfflinePending(userId, queryClient, {
        kind: "archive",
        activity: current,
      });
      markSaveSuccess();
      return;
    }

    archiveActivity(
      { activity: current },
      {
        onSuccess: () => {
          markSaveSuccess();
        },
        onError: () => {
          markSaveError();
        },
      },
    );
  }, [
    archiveActivity,
    clearDebounceTimer,
    markSaveError,
    markSaveSuccess,
    queryClient,
    userId,
  ]);

  const restore = useCallback(() => {
    const current = activityRef.current;

    if (!current?.id) {
      return;
    }

    clearDebounceTimer();
    pendingMutationRef.current = null;
    setSaveStatus("saving");

    if (!isOnline()) {
      if (!userId) {
        markSaveError();
        return;
      }

      saveActivityOfflinePending(userId, queryClient, {
        kind: "restore",
        activity: current,
      });
      markSaveSuccess();
      return;
    }

    restoreActivity(
      { activity: current },
      {
        onSuccess: () => {
          markSaveSuccess();
        },
        onError: () => {
          markSaveError();
        },
      },
    );
  }, [
    clearDebounceTimer,
    markSaveError,
    markSaveSuccess,
    queryClient,
    restoreActivity,
    userId,
  ]);

  const remove = useCallback(() => {
    const current = activityRef.current;

    if (!current?.id) {
      return;
    }

    clearDebounceTimer();
    pendingMutationRef.current = null;
    setSaveStatus("saving");

    if (!isOnline()) {
      if (!userId) {
        markSaveError();
        return;
      }

      saveActivityOfflinePending(userId, queryClient, {
        kind: "delete",
        activity: current,
      });
      markSaveSuccess();
      onDeleted?.();
      return;
    }

    deleteActivity(
      { activity: current },
      {
        onSuccess: () => {
          markSaveSuccess();
          onDeleted?.();
        },
        onError: () => {
          markSaveError();
        },
      },
    );
  }, [
    clearDebounceTimer,
    deleteActivity,
    markSaveError,
    markSaveSuccess,
    onDeleted,
    queryClient,
    userId,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSaveStatus("idle");
    pendingMutationRef.current = null;
    clearDebounceTimer();
  }, [clearDebounceTimer, isOpen, activity?.id]);

  useEffect(() => {
    return () => {
      clearDebounceTimer();

      if (savedResetTimerRef.current) {
        clearTimeout(savedResetTimerRef.current);
      }
    };
  }, [clearDebounceTimer]);

  return {
    saveStatus,
    handleChange,
    commitKey,
    archive,
    restore,
    remove,
  };
}
