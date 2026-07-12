/**
 * @file entities/note/tanstack/use-notes-realtime-sync.ts
 * Supabase Realtime subscription that patches TanStack note read caches.
 *
 * Purpose: Multi-tab / multi-device sync for the same authenticated user.
 * Used in: views/notes/ui/notes-client.tsx
 * Used for: postgres_changes on mf_notes → applyRealtimeNoteChange.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import type { Note } from "@/entities/note/model/types";
import {
  applyRealtimeNoteChange,
  type RealtimeNoteChangeEvent,
} from "@/entities/note/tanstack/apply-realtime-note-change";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/client";

export interface RealtimeNoteChangePayload {
  event: RealtimeNoteChangeEvent;
  note: Note | null;
  applied: boolean;
}

export interface UseNotesRealtimeSyncOptions {
  /** Called after a cache patch — e.g. orchestrator re-eval or form remoteSyncKey. */
  onNoteChange?: (payload: RealtimeNoteChangePayload) => void;
}

/**
 * Subscribes to mf_notes changes for the signed-in user and updates read caches.
 */
export function useNotesRealtimeSync({
  onNoteChange,
}: UseNotesRealtimeSyncOptions = {}): void {
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
        .channel(`notes-realtime-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: NOTES_TABLE,
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const event = payload.eventType as RealtimeNoteChangeEvent;
            const result = applyRealtimeNoteChange(
              queryClient,
              event,
              (payload.new as Record<string, unknown> | null) ?? null,
              (payload.old as Record<string, unknown> | null) ?? null,
            );

            if (!result.applied) {
              return;
            }

            onNoteChange?.({
              event: result.event,
              note: result.note,
              applied: result.applied,
            });
          },
        )
        .subscribe();

      return channel;
    }

    let channelPromise = subscribe();

    return () => {
      cancelled = true;

      void channelPromise.then((channel) => {
        if (channel) {
          void supabase.removeChannel(channel);
        }
      });
    };
  }, [onNoteChange, queryClient]);
}
