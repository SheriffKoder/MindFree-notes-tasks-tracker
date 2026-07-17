/**
 * @file features/activity/quick-record/model/use-quick-record.ts
 * Orchestrates inline quick-recording for one activity-day: local optimistic
 * value state + a debounced absolute upsert, with delete-on-empty.
 *
 * Purpose: the single "shared recording flow" Home (and later Tasks) calls to
 *          record. Keeps the card dumb; owns the debounce and the empty→delete
 *          decision (`isMeaningfulRecord`), mirroring how the drawer owns
 *          definition autosave (`use-config-orchestrator`).
 * Used in: features/activity/quick-record/ui/quick-record.tsx
 *
 * Values are absolute (the day's totals). The mutation hooks stay pure; the
 * *when* (debounce) and *whether-to-delete* live here.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Activity, ActivityRecord } from "@/entities/activity";
import { isMeaningfulRecord } from "@/entities/activity";
import {
  useDeleteActivityRecordMutation,
  useUpsertActivityRecordMutation,
} from "@/entities/activity/client";
import { getTodayIsoDate } from "@/shared/calendar";

const QUICK_RECORD_DEBOUNCE_MS = 500;

export interface UseQuickRecordOptions {
  /** Activity being recorded (drives the tracking-mode logic). */
  activity: Activity;
  /** Today's record for the activity, or `null` when nothing is recorded. */
  record: ActivityRecord | null;
  /** Day to record against (`YYYY-MM-DD`). Defaults to today. */
  date?: string;
}

export interface UseQuickRecordResult {
  /** Local optimistic count (updates instantly, persisted after debounce). */
  count: number;
  /** Local optimistic duration in minutes. */
  duration: number;
  /** Whether the primary tracked dimension is non-zero (boolean toggle state). */
  done: boolean;
  /** Sets the absolute count (`null` clears to `0`). */
  setCount: (value: number | null) => void;
  /** Sets the absolute duration in minutes (`null` clears to `0`). */
  setDuration: (value: number | null) => void;
  /** Flips a boolean activity between done (`1`) and not-done (`0`). */
  toggleDone: () => void;
  /** Adds minutes to the current duration (used by the Step 11 timer). */
  addMinutes: (delta: number) => void;
}

/**
 * Owns local value state seeded from the cache record, and debounces an
 * absolute upsert per edit. When an edit empties the record for its mode it
 * fires a delete instead. External cache changes re-seed the local state while
 * no edit is pending, so optimistic echoes and remote updates flow back in.
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
  const { mutate: upsertRecord } = useUpsertActivityRecordMutation();
  const { mutate: deleteRecord } = useDeleteActivityRecordMutation();

  const [count, setCountState] = useState(record?.count ?? 0);
  const [duration, setDurationState] = useState(record?.duration ?? 0);

  const countRef = useRef(count);
  const durationRef = useRef(duration);
  const recordRef = useRef(record);
  const pendingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    countRef.current = count;
    durationRef.current = duration;
    recordRef.current = record;
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
  }, [record?.count, record?.duration, record?.taskId, record?.date]);

  const persist = useCallback(
    (nextCount: number, nextDuration: number) => {
      pendingRef.current = true;
      clearDebounce();

      debounceRef.current = setTimeout(() => {
        const existing = recordRef.current;
        const settle = () => {
          pendingRef.current = false;
        };

        const meaningful = isMeaningfulRecord(
          { count: nextCount, duration: nextDuration },
          activity.trackingMode,
        );

        if (meaningful) {
          upsertRecord(
            {
              taskId: activity.id,
              date: recordDate,
              count: nextCount,
              duration: nextDuration,
              description: existing?.description ?? null,
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
      activity.trackingMode,
      clearDebounce,
      deleteRecord,
      recordDate,
      upsertRecord,
    ],
  );

  const setCount = useCallback(
    (value: number | null) => {
      const next = value ?? 0;
      setCountState(next);
      persist(next, durationRef.current);
    },
    [persist],
  );

  const setDuration = useCallback(
    (value: number | null) => {
      const next = value ?? 0;
      setDurationState(next);
      persist(countRef.current, next);
    },
    [persist],
  );

  const toggleDone = useCallback(() => {
    const next = countRef.current > 0 ? 0 : 1;
    setCountState(next);
    persist(next, durationRef.current);
  }, [persist]);

  const addMinutes = useCallback(
    (delta: number) => {
      const next = Math.max(0, durationRef.current + delta);
      setDurationState(next);
      persist(countRef.current, next);
    },
    [persist],
  );

  useEffect(() => {
    return () => {
      clearDebounce();
    };
  }, [clearDebounce]);

  const done =
    activity.trackingMode === "duration" ? duration > 0 : count > 0;

  return {
    count,
    duration,
    done,
    setCount,
    setDuration,
    toggleDone,
    addMinutes,
  };
}
