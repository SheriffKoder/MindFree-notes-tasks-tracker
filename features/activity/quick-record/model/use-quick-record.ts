/**
 * @file features/activity/quick-record/model/use-quick-record.ts
 * Orchestrates one activity-day record form: local optimistic values,
 * description and goals, a debounced absolute upsert, and delete-on-empty.
 *
 * Purpose: the single "shared recording flow" Home and Tasks call to record.
 *          Keeps the card dumb; owns the debounce and the empty→delete
 *          decision (`isMeaningfulRecord`), mirroring how the drawer owns
 *          definition autosave (`use-config-orchestrator`).
 * Used in: features/activity/quick-record/ui/quick-record.tsx,
 *          features/activity/quick-record/ui/quick-record-card.tsx
 *
 * Values are absolute (the day's totals). The mutation hooks stay pure; the
 * *when* (debounce) and *whether-to-delete* live here. Existing records use
 * their frozen tracking-mode snapshot for controls and meaningfulness; empty
 * slots use the activity's current mode.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  Activity,
  ActivityRecord,
  TrackingMode,
} from "@/entities/activity";
import {
  isMeaningfulRecord,
  resolveRecordConfiguration,
} from "@/entities/activity";
import {
  useDeleteActivityRecordMutation,
  useUpsertActivityRecordMutation,
} from "@/entities/activity/client";
import { saveActivityOfflinePending } from "@/entities/activity/offline";
import { getTodayIsoDate } from "@/shared/calendar";
import { isOnline, useAuthUserId } from "@/shared/offline-queue";

const QUICK_RECORD_DEBOUNCE_MS = 500;

export interface UseQuickRecordOptions {
  /** Activity being recorded (current definition; snapshots win when recorded). */
  activity: Activity;
  /** Today's record for the activity, or `null` when nothing is recorded. */
  record: ActivityRecord | null;
  /** Day to record against (`YYYY-MM-DD`). Defaults to today. */
  date?: string;
}

export interface UseQuickRecordResult {
  /** Effective tracking mode (record snapshot, else current activity). */
  trackingMode: TrackingMode;
  /** Local optimistic count (updates instantly, persisted after debounce). */
  count: number;
  /** Local optimistic duration in minutes. */
  duration: number;
  /** Local optimistic note text (`null` when empty). */
  description: string | null;
  /** Editable per-day count goal (`null` when unbounded). */
  goal: number | null;
  /** Editable per-day duration goal in minutes (`null` when unbounded). */
  goalDuration: number | null;
  /** Whether the primary tracked dimension is non-zero (boolean toggle state). */
  done: boolean;
  /** Sets the absolute count (`null` clears to `0`). */
  setCount: (value: number | null) => void;
  /** Sets the absolute duration in minutes (`null` clears to `0`). */
  setDuration: (value: number | null) => void;
  /** Sets the record note (`null` or blank clears the description). */
  setDescription: (value: string | null) => void;
  /** Sets the per-day count goal. */
  setGoal: (value: number | null) => void;
  /** Sets the per-day duration goal in minutes. */
  setGoalDuration: (value: number | null) => void;
  /** Flips a boolean activity between done (`1`) and not-done (`0`). */
  toggleDone: () => void;
  /** Adds minutes to the current duration (used by the Step 11 timer). */
  addMinutes: (delta: number) => void;
}

interface QuickRecordDraft {
  count: number;
  duration: number;
  description: string | null;
  goal: number | null;
  goalDuration: number | null;
}

function normalizeDescription(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : value;
}

/**
 * Owns local value state seeded from the cache record, and debounces an
 * absolute upsert per edit. When an edit empties the record for its effective
 * mode it fires a delete instead. External cache changes re-seed the local
 * state while no edit is pending, so optimistic echoes and remote updates flow
 * back in.
 *
 * @param options - activity, its current record, and the target day
 * @returns current values plus edit handlers
 */
export function useQuickRecord({
  activity,
  record,
  date,
}: UseQuickRecordOptions): UseQuickRecordResult {
  const recordDate = date ?? getTodayIsoDate();
  const queryClient = useQueryClient();
  const userId = useAuthUserId();
  const { mutate: upsertRecord } = useUpsertActivityRecordMutation();
  const { mutate: deleteRecord } = useDeleteActivityRecordMutation();

  const configuration = useMemo(
    () => resolveRecordConfiguration(activity, record),
    [activity, record],
  );
  const trackingMode = configuration.trackingMode;

  const [count, setCountState] = useState(record?.count ?? 0);
  const [duration, setDurationState] = useState(record?.duration ?? 0);
  const [description, setDescriptionState] = useState<string | null>(
    record?.description ?? null,
  );
  const [goal, setGoalState] = useState(configuration.goal);
  const [goalDuration, setGoalDurationState] = useState(
    configuration.goalDuration,
  );

  const countRef = useRef(count);
  const durationRef = useRef(duration);
  const descriptionRef = useRef(description);
  const goalRef = useRef(goal);
  const goalDurationRef = useRef(goalDuration);
  const recordRef = useRef(record);
  const trackingModeRef = useRef(trackingMode);
  const pendingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    countRef.current = count;
    durationRef.current = duration;
    descriptionRef.current = description;
    goalRef.current = goal;
    goalDurationRef.current = goalDuration;
    recordRef.current = record;
    trackingModeRef.current = trackingMode;
  });

  const clearDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (pendingRef.current) {
      return;
    }

    setCountState(record?.count ?? 0);
    setDurationState(record?.duration ?? 0);
    setDescriptionState(record?.description ?? null);
    setGoalState(configuration.goal);
    setGoalDurationState(configuration.goalDuration);
  }, [
    configuration.goal,
    configuration.goalDuration,
    record?.count,
    record?.description,
    record?.duration,
    record?.taskId,
    record?.date,
  ]);

  const persist = useCallback(
    (draft: QuickRecordDraft, keepEmpty = false) => {
      pendingRef.current = true;
      clearDebounce();

      debounceRef.current = setTimeout(() => {
        const existing = recordRef.current;
        const settle = () => {
          pendingRef.current = false;
        };

        const descriptionToSave = normalizeDescription(draft.description);
        const meaningful = isMeaningfulRecord(
          { count: draft.count, duration: draft.duration },
          trackingModeRef.current,
        );

        // Offline — queue + optimistic hub apply; skip TanStack mutate.
        if (!isOnline()) {
          if (!userId) {
            pendingRef.current = false;
            return;
          }

          if (meaningful || descriptionToSave !== null || keepEmpty) {
            saveActivityOfflinePending(userId, queryClient, {
              kind: "record-upsert",
              taskId: activity.id,
              date: recordDate,
              count: draft.count,
              duration: draft.duration,
              description: descriptionToSave,
              trackingMode: trackingModeRef.current,
              goal: draft.goal,
              goalDuration: draft.goalDuration,
            });
            settle();
            return;
          }

          if (existing) {
            saveActivityOfflinePending(userId, queryClient, {
              kind: "record-delete",
              record: existing,
            });
            settle();
            return;
          }

          pendingRef.current = false;
          return;
        }

        // A non-empty note alone is enough to keep/create the row so typing in
        // the description panel persists before a count/minute is set. Goal
        // edits explicitly keep an empty row because the goal itself is the
        // form change being saved.
        if (meaningful || descriptionToSave !== null || keepEmpty) {
          upsertRecord(
            {
              taskId: activity.id,
              date: recordDate,
              count: draft.count,
              duration: draft.duration,
              description: descriptionToSave,
              trackingMode: trackingModeRef.current,
              goal: draft.goal,
              goalDuration: draft.goalDuration,
            },
            { onSettled: settle },
          );
          return;
        }

        if (existing) {
          deleteRecord({ record: existing }, { onSettled: settle });
          return;
        }

        pendingRef.current = false;
      }, QUICK_RECORD_DEBOUNCE_MS);
    },
    [
      activity.id,
      clearDebounce,
      deleteRecord,
      queryClient,
      recordDate,
      upsertRecord,
      userId,
    ],
  );

  const setCount = useCallback(
    (value: number | null) => {
      const next = value ?? 0;
      setCountState(next);
      persist({
        count: next,
        duration: durationRef.current,
        description: descriptionRef.current,
        goal: goalRef.current,
        goalDuration: goalDurationRef.current,
      });
    },
    [persist],
  );

  const setDuration = useCallback(
    (value: number | null) => {
      const next = value ?? 0;
      setDurationState(next);
      persist({
        count: countRef.current,
        duration: next,
        description: descriptionRef.current,
        goal: goalRef.current,
        goalDuration: goalDurationRef.current,
      });
    },
    [persist],
  );

  const setDescription = useCallback(
    (value: string | null) => {
      setDescriptionState(value);
      persist({
        count: countRef.current,
        duration: durationRef.current,
        description: value,
        goal: goalRef.current,
        goalDuration: goalDurationRef.current,
      });
    },
    [persist],
  );

  const setGoal = useCallback(
    (value: number | null) => {
      setGoalState(value);
      persist(
        {
          count: countRef.current,
          duration: durationRef.current,
          description: descriptionRef.current,
          goal: value,
          goalDuration: goalDurationRef.current,
        },
        true,
      );
    },
    [persist],
  );

  const setGoalDuration = useCallback(
    (value: number | null) => {
      setGoalDurationState(value);
      persist(
        {
          count: countRef.current,
          duration: durationRef.current,
          description: descriptionRef.current,
          goal: goalRef.current,
          goalDuration: value,
        },
        true,
      );
    },
    [persist],
  );

  const toggleDone = useCallback(() => {
    const next = countRef.current > 0 ? 0 : 1;
    setCountState(next);
    persist({
      count: next,
      duration: durationRef.current,
      description: descriptionRef.current,
      goal: goalRef.current,
      goalDuration: goalDurationRef.current,
    });
  }, [persist]);

  const addMinutes = useCallback(
    (delta: number) => {
      const next = Math.max(0, durationRef.current + delta);
      setDurationState(next);
      persist({
        count: countRef.current,
        duration: next,
        description: descriptionRef.current,
        goal: goalRef.current,
        goalDuration: goalDurationRef.current,
      });
    },
    [persist],
  );

  useEffect(() => {
    return () => {
      clearDebounce();
    };
  }, [clearDebounce]);

  const done =
    trackingMode === "duration" ? duration > 0 : count > 0;

  return {
    trackingMode,
    count,
    duration,
    description,
    goal,
    goalDuration,
    done,
    setCount,
    setDuration,
    setDescription,
    setGoal,
    setGoalDuration,
    toggleDone,
    addMinutes,
  };
}
