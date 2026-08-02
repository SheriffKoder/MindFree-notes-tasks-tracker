/**
 * @file shared/calendar/model/use-month-calendar-day-hover.ts
 * Desktop day-cell pointer handlers for MonthCalendar (fine-pointer gate + rAF move).
 */

"use client";

import { useRef, type PointerEvent } from "react";

import { isFinePointerHover } from "@/shared/calendar/lib/is-fine-pointer-hover";
import type { CalendarDayHoverPoint } from "@/shared/calendar/model/types";

export interface MonthCalendarDayHoverCallbacks {
  onDayHoverStart?: (date: string, point: CalendarDayHoverPoint) => void;
  onDayHoverMove?: (date: string, point: CalendarDayHoverPoint) => void;
  onDayHoverEnd?: (date: string) => void;
}

export interface MonthCalendarDayHoverHandlers {
  /** Whether any hover callback is wired (skip attaching listeners when false). */
  hasHoverHandlers: boolean;
  onPointerEnter: (
    date: string,
    event: PointerEvent<HTMLButtonElement>,
  ) => void;
  onPointerMove: (
    date: string,
    event: PointerEvent<HTMLButtonElement>,
  ) => void;
  onPointerLeave: (date: string) => void;
}

/**
 * Builds gated, rAF-throttled pointer handlers for in-month calendar cells.
 */
export function useMonthCalendarDayHover({
  onDayHoverStart,
  onDayHoverMove,
  onDayHoverEnd,
}: MonthCalendarDayHoverCallbacks): MonthCalendarDayHoverHandlers {
  const moveRafRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<{ date: string; x: number; y: number } | null>(
    null,
  );

  const hasHoverHandlers =
    onDayHoverStart != null || onDayHoverMove != null || onDayHoverEnd != null;

  function onPointerEnter(
    date: string,
    event: PointerEvent<HTMLButtonElement>,
  ): void {
    if (!hasHoverHandlers || !isFinePointerHover()) {
      return;
    }

    onDayHoverStart?.(date, { x: event.clientX, y: event.clientY });
  }

  function onPointerMove(
    date: string,
    event: PointerEvent<HTMLButtonElement>,
  ): void {
    if (!onDayHoverMove || !isFinePointerHover()) {
      return;
    }

    pendingMoveRef.current = {
      date,
      x: event.clientX,
      y: event.clientY,
    };

    if (moveRafRef.current != null) {
      return;
    }

    moveRafRef.current = window.requestAnimationFrame(() => {
      moveRafRef.current = null;
      const pending = pendingMoveRef.current;

      if (!pending) {
        return;
      }

      pendingMoveRef.current = null;
      onDayHoverMove(pending.date, { x: pending.x, y: pending.y });
    });
  }

  function onPointerLeave(date: string): void {
    if (!hasHoverHandlers || !isFinePointerHover()) {
      return;
    }

    pendingMoveRef.current = null;

    if (moveRafRef.current != null) {
      window.cancelAnimationFrame(moveRafRef.current);
      moveRafRef.current = null;
    }

    onDayHoverEnd?.(date);
  }

  return {
    hasHoverHandlers,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
  };
}
