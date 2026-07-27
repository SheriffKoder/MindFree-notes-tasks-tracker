/**
 * @file shared/lib/today/live-today-store.ts
 * Shared external store for wall-clock "today" — one listener set, many subscribers.
 *
 * Refreshes on tab `visibilitychange` (visible) and `window` `focus` so long-lived
 * SPA tabs pick up local midnight without a full remount.
 *
 * Demo fixed dates stay in `useTodayIsoDate`; this store is always the real calendar day.
 */

import { getTodayIsoDate } from "@/shared/lib/today/get-today-iso-date";

let todayIso = getTodayIsoDate();
const listeners = new Set<() => void>();
let attached = false;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Re-reads the local calendar day and notifies subscribers when it changes.
 */
export function refreshLiveTodayFromClock(): void {
  const next = getTodayIsoDate();

  if (next === todayIso) {
    return;
  }

  todayIso = next;
  emit();
}

function onVisibilityChange(): void {
  if (document.visibilityState === "visible") {
    refreshLiveTodayFromClock();
  }
}

function onWindowFocus(): void {
  refreshLiveTodayFromClock();
}

function attachBrowserListeners(): void {
  if (attached || typeof window === "undefined") {
    return;
  }

  attached = true;
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("focus", onWindowFocus);
}

function detachBrowserListeners(): void {
  if (!attached || typeof window === "undefined") {
    return;
  }

  attached = false;
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("focus", onWindowFocus);
}

/**
 * Subscribe to live today changes. Attaches browser listeners while anyone listens.
 */
export function subscribeLiveToday(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  attachBrowserListeners();
  // Catch a day roll that happened while nothing was subscribed.
  refreshLiveTodayFromClock();

  return () => {
    listeners.delete(onStoreChange);

    if (listeners.size === 0) {
      detachBrowserListeners();
    }
  };
}

/** Client snapshot for {@link useSyncExternalStore}. */
export function getLiveTodaySnapshot(): string {
  return todayIso;
}

/** SSR / pre-hydration snapshot — always fresh wall clock. */
export function getLiveTodayServerSnapshot(): string {
  return getTodayIsoDate();
}
