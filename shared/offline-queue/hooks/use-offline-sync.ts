/**
 * @file shared/offline-queue/hooks/use-offline-sync.ts
 * Page hook — merge stored writes on load, flush when back online.
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient } from "@/shared/lib/supabase/client";
import {
  getOfflineWrites,
  isOnline,
} from "@/shared/offline-queue/lib/offline-store";
import type { OfflineWrite } from "@/shared/offline-queue/lib/offline-store";
import { useOnlineStatus } from "@/shared/offline-queue/hooks/use-online-status";

export interface OfflineEntityAdapter {
  entity: string;
  merge: (writes: OfflineWrite[]) => void;
  flush: (writes: OfflineWrite[]) => Promise<void>;
}

/**
 * Resolves the signed-in user id once on mount (client-only).
 */
export function useAuthUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(function resolveAuthUserId() {
    let cancelled = false;
    const supabase = createClient();

    void supabase.auth.getUser().then(function applyAuthUserId({ data }) {
      if (!cancelled) {
        setUserId(data.user?.id ?? null);
      }
    });

    return function cancelAuthUserId() {
      cancelled = true;
    };
  }, []);

  return userId;
}

/**
 * Merges offline writes after load; flushes when the browser reconnects or regains focus.
 */
export function useOfflineSync(
  userId: string | null,
  adapters: OfflineEntityAdapter[],
): void {
  const browserOnline = useOnlineStatus();

  const mergeAll = useCallback(() => {
    if (!userId) {
      return;
    }

    for (const adapter of adapters) {
      const writes = getOfflineWrites(userId, adapter.entity);

      if (writes.length > 0) {
        adapter.merge(writes);
      }
    }
  }, [adapters, userId]);

  const flushAll = useCallback(async () => {
    if (!userId || !isOnline()) {
      return;
    }

    for (const adapter of adapters) {
      const writes = getOfflineWrites(userId, adapter.entity);

      if (writes.length > 0) {
        await adapter.flush(writes);
      }
    }
  }, [adapters, userId]);

  useEffect(
    function mergeOfflineWritesOnLoad() {
      mergeAll();
    },
    [mergeAll],
  );

  useEffect(
    function flushOfflineWritesOnReconnect() {
      if (!browserOnline) {
        return;
      }

      void flushAll();
    },
    [browserOnline, flushAll],
  );

  useEffect(
    function flushOfflineWritesOnFocus() {
      function handleWindowFocus() {
        void flushAll();
      }

      window.addEventListener("focus", handleWindowFocus);

      return function removeWindowFocusListener() {
        window.removeEventListener("focus", handleWindowFocus);
      };
    },
    [flushAll],
  );
}
