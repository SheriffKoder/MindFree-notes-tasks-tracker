/**
 * @file features/activity/activity-drawer/model/use-activity-drawer-realtime-sync.ts
 * Coordinates dirty-form protection and realtime updates for the definition drawer.
 *
 * Purpose: Keep realtime side effects and editor-sync state outside the drawer UI.
 * Used in: features/activity/activity-drawer/ui/activity-drawer.tsx
 * Used for: Tracking local edits, registering the sync guard, and accepting safe
 *           remote revisions into an idle form.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { RealtimeActivityChangePayload } from "@/entities/activity/client";
import type {
  ActivityFormChangeMeta,
  ActivityFormValues,
} from "@/entities/activity/editor/model/types";
import {
  registerActivityEditorSyncState,
  shouldSyncRemoteIntoForm,
} from "@/features/activity/activity-drawer/model/activity-editor-sync-guard";
import { registerActivityDrawerRealtimeHandler } from "@/features/activity/activity-drawer/model/activity-realtime-drawer-bridge";

export interface UseActivityDrawerRealtimeSyncOptions {
  isOpen: boolean;
  activityId: string | null;
  resetKey: string;
  onChange: (values: ActivityFormValues, meta: ActivityFormChangeMeta) => void;
}

export interface UseActivityDrawerRealtimeSyncResult {
  /** Bumped when the form may safely pull the latest cached activity fields. */
  remoteSyncKey: number;
  /** Form change handler that also updates the realtime dirty-state guard. */
  handleChangeWithDirty: (
    values: ActivityFormValues,
    meta: ActivityFormChangeMeta,
  ) => void;
}

/**
 * Connects an open activity form to the drawer's realtime synchronization bridge.
 */
export function useActivityDrawerRealtimeSync({
  isOpen,
  activityId,
  resetKey,
  onChange,
}: UseActivityDrawerRealtimeSyncOptions): UseActivityDrawerRealtimeSyncResult {
  const [remoteSyncKey, setRemoteSyncKey] = useState(0);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const openedAtRef = useRef(0);
  const lastLocalEditAtRef = useRef<number | null>(null);

  const handleChangeWithDirty = useCallback(
    function handleChangeWithDirty(
      values: ActivityFormValues,
      meta: ActivityFormChangeMeta,
    ) {
      if (meta.isDirty) {
        lastLocalEditAtRef.current = Date.now();
      }

      setIsFormDirty(meta.isDirty);
      onChange(values, meta);
    },
    [onChange],
  );

  useEffect(
    function resetEditorSyncTiming() {
      if (isOpen) {
        openedAtRef.current = Date.now();
        lastLocalEditAtRef.current = null;
        setIsFormDirty(false);
        setRemoteSyncKey(0);
      }
    },
    [isOpen, resetKey],
  );

  useEffect(
    function publishEditorSyncState() {
      registerActivityEditorSyncState({
        isOpen,
        activityId,
        isDirty: isFormDirty,
        openedAt: openedAtRef.current,
        lastLocalEditAt: lastLocalEditAtRef.current,
      });
    },
    [isFormDirty, isOpen, activityId],
  );

  useEffect(
    function registerRealtimeDrawerSync() {
      function handleRealtimeChange({
        activity: changedActivity,
      }: RealtimeActivityChangePayload) {
        if (
          changedActivity &&
          shouldSyncRemoteIntoForm(changedActivity.id)
        ) {
          setRemoteSyncKey(function incrementRemoteSyncKey(previous) {
            return previous + 1;
          });
        }
      }

      registerActivityDrawerRealtimeHandler(handleRealtimeChange);

      return function unregisterRealtimeDrawerSync() {
        registerActivityDrawerRealtimeHandler(null);
      };
    },
    [],
  );

  return {
    remoteSyncKey,
    handleChangeWithDirty,
  };
}
