/**
 * @file shared/calendar/lib/calendar-hover-store.ts
 * Module-level hover state for the desktop calendar cursor tooltip.
 *
 * Holds only pointer chrome (`mode`, `date`, `x`, `y`) — no note/activity payloads.
 * Writers call store functions directly; UI subscribes via `useCalendarHover`.
 */

export type CalendarHoverMode = "idle" | "following" | "frozen";

export interface CalendarHoverState {
  mode: CalendarHoverMode;
  /** ISO date (`YYYY-MM-DD`) under the tip, or `null` when idle. */
  date: string | null;
  /** Viewport X of the cursor (or frozen tip anchor). */
  x: number;
  /** Viewport Y of the cursor (or frozen tip anchor). */
  y: number;
}

const IDLE_STATE: CalendarHoverState = {
  mode: "idle",
  date: null,
  x: 0,
  y: 0,
};

let state: CalendarHoverState = IDLE_STATE;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function setState(next: CalendarHoverState): void {
  if (
    next.mode === state.mode &&
    next.date === state.date &&
    next.x === state.x &&
    next.y === state.y
  ) {
    return;
  }

  state = next;
  emit();
}

/**
 * Open or retarget the tip while following the cursor.
 * No-op while frozen (pointer is on the tip panel).
 */
export function setCalendarHoverFollowing(
  date: string,
  x: number,
  y: number,
): void {
  cancelScheduledClearCalendarHover();

  if (state.mode === "frozen") {
    return;
  }

  setState({ mode: "following", date, x, y });
}

/**
 * Update cursor coords while following. No-op when idle or frozen.
 */
export function moveCalendarHoverPointer(x: number, y: number): void {
  if (state.mode !== "following") {
    return;
  }

  setState({ ...state, x, y });
}

/**
 * Lock tip position so the user can scroll/read without cell updates moving it.
 * Only valid from `following`.
 */
export function freezeCalendarHover(): void {
  cancelScheduledClearCalendarHover();

  if (state.mode !== "following") {
    return;
  }

  setState({ ...state, mode: "frozen" });
}

/**
 * Retarget after leaving the tip (works from `frozen`).
 * Pass `date: null` to close.
 */
export function resolveCalendarHover(
  date: string | null,
  x: number,
  y: number,
): void {
  cancelScheduledClearCalendarHover();

  if (date == null) {
    setState(IDLE_STATE);
    return;
  }

  setState({ mode: "following", date, x, y });
}

/** Close the tip and reset to idle. */
export function clearCalendarHover(): void {
  cancelScheduledClearCalendarHover();
  setState(IDLE_STATE);
}

const CLEAR_GRACE_MS = 80;
let clearGraceTimer: ReturnType<typeof setTimeout> | null = null;

/** Cancel a pending grace clear (e.g. when entering the tip or another cell). */
export function cancelScheduledClearCalendarHover(): void {
  if (clearGraceTimer == null) {
    return;
  }

  clearTimeout(clearGraceTimer);
  clearGraceTimer = null;
}

/**
 * Clear soon if still `following` — gives the pointer time to enter the tip
 * and freeze before the tip disappears when leaving a cell.
 */
export function scheduleClearCalendarHover(
  delayMs: number = CLEAR_GRACE_MS,
): void {
  cancelScheduledClearCalendarHover();

  clearGraceTimer = setTimeout(() => {
    clearGraceTimer = null;

    if (state.mode === "following") {
      setState(IDLE_STATE);
    }
  }, delayMs);
}

/** Client snapshot for {@link useSyncExternalStore}. */
export function getCalendarHoverSnapshot(): CalendarHoverState {
  return state;
}

/** SSR / pre-hydration snapshot — always idle (no pointer on server). */
export function getCalendarHoverServerSnapshot(): CalendarHoverState {
  return IDLE_STATE;
}

/** Subscribe to hover state changes. */
export function subscribeCalendarHover(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
  };
}
