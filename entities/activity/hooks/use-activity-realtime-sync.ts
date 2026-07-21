/**
 * @file entities/activity/hooks/use-activity-realtime-sync.ts
 * Supabase Realtime subscription that patches TanStack activity read caches.
 *
 * Purpose: Multi-tab / multi-device sync for the same authenticated user.
 * Used in: activity page client + Home island (Step 5)
 * Used for: postgres_changes on mf_task + mf_task_record → apply adapters.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  applyRealtimeActivityChange,
  applyRealtimeActivityRecordChange,
  type RealtimeActivityChangeEvent,
  type RealtimeActivityRecordChangeEvent,
} from "@/entities/activity/cache";
import type { Activity, ActivityRecord } from "@/entities/activity/model/types";
import {
  ACTIVITIES_TABLE,
  ACTIVITY_RECORDS_TABLE,
} from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/client";

export interface RealtimeActivityChangePayload {
  event: RealtimeActivityChangeEvent;
  activity: Activity | null;
  applied: boolean;
}

export interface RealtimeActivityRecordChangePayload {
  event: RealtimeActivityRecordChangeEvent;
  record: ActivityRecord | null;
  applied: boolean;
}

export interface UseActivityRealtimeSyncOptions {
  /** Called after a definition cache patch — e.g. definition drawer bridge. */
  onActivityChange?: (payload: RealtimeActivityChangePayload) => void;
  /** Called after a record cache patch — optional; unused in v1 mounts. */
  onRecordChange?: (payload: RealtimeActivityRecordChangePayload) => void;
}

/**
 * Subscribes to mf_task + mf_task_record changes for the signed-in user and
 * updates warm TanStack read caches.
 */
export function useActivityRealtimeSync({
  onActivityChange,
  onRecordChange,
}: UseActivityRealtimeSyncOptions = {}): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function subscribe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled || !user) {
        return;
      }

      const channel = supabase
        .channel(`activities-realtime-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: ACTIVITIES_TABLE,
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const event = payload.eventType as RealtimeActivityChangeEvent;
            const result = applyRealtimeActivityChange(
              queryClient,
              event,
              (payload.new as Record<string, unknown> | null) ?? null,
              (payload.old as Record<string, unknown> | null) ?? null,
            );

            if (!result.applied) {
              return;
            }

            onActivityChange?.({
              event: result.event,
              activity: result.activity,
              applied: result.applied,
            });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: ACTIVITY_RECORDS_TABLE,
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const event =
              payload.eventType as RealtimeActivityRecordChangeEvent;
            const result = applyRealtimeActivityRecordChange(
              queryClient,
              event,
              (payload.new as Record<string, unknown> | null) ?? null,
              (payload.old as Record<string, unknown> | null) ?? null,
            );

            if (!result.applied) {
              return;
            }

            onRecordChange?.({
              event: result.event,
              record: result.record,
              applied: result.applied,
            });
          },
        )
        .subscribe();

      return channel;
    }

    const channelPromise = subscribe();

    return () => {
      cancelled = true;

      void channelPromise.then((channel) => {
        if (channel) {
          void supabase.removeChannel(channel);
        }
      });
    };
  }, [onActivityChange, onRecordChange, queryClient]);
}
