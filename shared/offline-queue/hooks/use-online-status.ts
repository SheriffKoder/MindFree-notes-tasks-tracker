/**
 * @file shared/offline-queue/hooks/use-online-status.ts
 * Subscribes to browser online/offline events.
 */

"use client";

import { useEffect, useState } from "react";

import { isOnline } from "@/shared/offline-queue/lib/offline-store";

/**
 * @returns current browser online status; updates on `online` / `offline` events.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(isOnline);

  useEffect(function subscribeToOnlineStatus() {
    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return function unsubscribeFromOnlineStatus() {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
