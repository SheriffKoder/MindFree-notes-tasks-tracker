/**
 * @file entities/payment/hooks/use-payments-realtime-sync.ts
 * Supabase Realtime subscription that patches TanStack payment month caches.
 *
 * Purpose: Multi-tab / multi-device sync for the same authenticated user.
 * Used in: views/payments/ui/payments-client.tsx (Home mount in Step 11)
 * Used for: postgres_changes on mf_payments → applyRealtimePaymentChange.
 *
 * Function Index:
 * - usePaymentsRealtimeSync — subscribe INSERT/UPDATE (user filter) + DELETE (unfiltered)
 *
 * Steps (effect):
 * 1. Resolve signed-in user; bail if none.
 * 2. Subscribe INSERT/UPDATE with user_id filter; DELETE unfiltered.
 * 3. Forward each payload through applyRealtimePaymentChange; notify on apply.
 * 4. Cleanup — remove channel on unmount / cancel.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  applyRealtimePaymentChange,
  type RealtimePaymentChangeEvent,
} from "@/entities/payment/cache/apply-realtime-payment-change";
import type { Payment } from "@/entities/payment/model/types";
import { PAYMENTS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/client";

export interface RealtimePaymentChangePayload {
  event: RealtimePaymentChangeEvent;
  payment: Payment | null;
  applied: boolean;
}

export interface UsePaymentsRealtimeSyncOptions {
  /** Called after a cache patch — e.g. drawer remoteSyncKey (optional bridge). */
  onPaymentChange?: (payload: RealtimePaymentChangePayload) => void;
}

/**
 * Subscribes to mf_payments changes for the signed-in user and updates month caches.
 *
 * INSERT/UPDATE use a `user_id` filter. DELETE cannot — Postgres replica
 * identity / Realtime omit filterable non-PK columns on delete — so DELETE is
 * unfiltered and `applyRealtimePaymentChange` only clears ids already in cache.
 */
export function usePaymentsRealtimeSync({
  onPaymentChange,
}: UsePaymentsRealtimeSyncOptions = {}): void {
  const queryClient = useQueryClient();

  useEffect(
    function subscribePaymentsRealtime() {
      const supabase = createClient();
      let cancelled = false;

      async function subscribe() {
        /////////////////////////////////
        // 1. Auth — require a signed-in user for the channel filter
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled || !user) {
          return;
        }

        /////////////////////////////////
        // 2–3. Payload handler — apply → optional page/drawer callback
        const handlePayload = (payload: {
          eventType: string;
          new: Record<string, unknown>;
          old: Record<string, unknown>;
        }) => {
          const event = payload.eventType as RealtimePaymentChangeEvent;
          const result = applyRealtimePaymentChange(
            queryClient,
            event,
            (payload.new as Record<string, unknown> | null) ?? null,
            (payload.old as Record<string, unknown> | null) ?? null,
          );

          if (!result.applied) {
            return;
          }

          onPaymentChange?.({
            event: result.event,
            payment: result.payment,
            applied: result.applied,
          });
        };

        const userFilter = `user_id=eq.${user.id}`;

        /////////////////////////////////
        // 2. Channel — filtered INSERT/UPDATE; unfiltered DELETE
        const channel = supabase
          .channel(`payments-realtime-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: PAYMENTS_TABLE,
              filter: userFilter,
            },
            handlePayload,
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: PAYMENTS_TABLE,
              filter: userFilter,
            },
            handlePayload,
          )
          .on(
            "postgres_changes",
            {
              event: "DELETE",
              schema: "public",
              table: PAYMENTS_TABLE,
            },
            handlePayload,
          )
          .subscribe();

        return channel;
      }

      const channelPromise = subscribe();

      /////////////////////////////////
      // 4. Cleanup — cancel in-flight subscribe and drop the channel
      return function removePaymentsRealtimeChannel() {
        cancelled = true;

        void channelPromise.then((channel) => {
          if (channel) {
            void supabase.removeChannel(channel);
          }
        });
      };
    },
    [onPaymentChange, queryClient],
  );
}
