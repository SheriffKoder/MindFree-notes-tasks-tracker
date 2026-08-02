/**
 * @file shared/calendar/ui/calendar-cursor-tooltip.tsx
 * Portal shell for the desktop calendar cursor-following peek panel.
 *
 * Subscribes to the hover store; joins `date` → caller `days` via getDate/hasContent.
 * Feature markup is supplied only through `renderContent`.
 *
 * Wheel over the calendar (or anywhere) scrolls this panel while it is open —
 * the tip follows the cursor so users often cannot move onto it to scroll.
 */

"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import {
  freezeCalendarHover,
  resolveCalendarHover,
} from "@/shared/calendar/lib/calendar-hover-store";
import { resolveCalendarDateUnderPoint } from "@/shared/calendar/lib/resolve-calendar-date-under-point";
import { computeTooltipPosition } from "@/shared/calendar/lib/tooltip-position";
import { useCalendarHover } from "@/shared/calendar/model/use-calendar-hover";

const PANEL_CLASS =
  "pointer-events-auto fixed z-[70] max-h-[min(24rem,50vh)] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg";

const DEFAULT_WIDTH = "min(20rem, calc(100vw - 1rem))";

export interface CalendarCursorTooltipProps<TDay> {
  /** Pane calendar days already loaded for the visible month. */
  days: TDay[];
  /** ISO date key for a day (usually `d => d.date`). */
  getDate: (day: TDay) => string;
  /** Whether the day has peekable content (empty days hide the tip). */
  hasContent: (day: TDay) => boolean;
  /** Feature-owned body for the matched day. */
  renderContent: (day: TDay) => ReactNode;
  /**
   * CSS width for the panel (e.g. `"14rem"`).
   * Defaults to `min(20rem, calc(100vw - 1rem))`.
   */
  width?: string;
  className?: string;
}

/**
 * Floating peek panel near the cursor while calendar hover mode is active.
 */
export function CalendarCursorTooltip<TDay>({
  days,
  getDate,
  hasContent,
  renderContent,
  width = DEFAULT_WIDTH,
  className,
}: CalendarCursorTooltipProps<TDay>) {
  const hover = useCalendarHover();
  const panelRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const day =
    hover.mode !== "idle" && hover.date
      ? days.find((entry) => getDate(entry) === hover.date)
      : undefined;

  const visible =
    hover.mode !== "idle" &&
    hover.date != null &&
    day != null &&
    hasContent(day);

  useLayoutEffect(() => {
    if (!visible || !panelRef.current) {
      return;
    }

    const rect = panelRef.current.getBoundingClientRect();
    setSize((prev) =>
      prev.width === rect.width && prev.height === rect.height
        ? prev
        : { width: rect.width, height: rect.height },
    );
  }, [visible, hover.date, day, width]);

  // Reset scroll when the tip retargets to another day.
  useLayoutEffect(() => {
    if (!visible || !panelRef.current) {
      return;
    }

    panelRef.current.scrollTop = 0;
  }, [visible, hover.date]);

  // Forward wheel to the tip while it is open (cursor usually stays on the cell).
  useEffect(() => {
    if (!visible) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      const panel = panelRef.current;

      if (!panel || panel.scrollHeight <= panel.clientHeight) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = panel;
      const delta = event.deltaY;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
        return;
      }

      event.preventDefault();
      panel.scrollTop += delta;
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [visible]);

  if (!visible || typeof document === "undefined" || !day) {
    return null;
  }

  const viewport =
    typeof window === "undefined"
      ? { width: 0, height: 0 }
      : { width: window.innerWidth, height: window.innerHeight };

  const position = computeTooltipPosition(
    { x: hover.x, y: hover.y },
    size.width > 0 ? size : { width: 320, height: 200 },
    viewport,
  );

  const style: CSSProperties = {
    left: position.left,
    top: position.top,
    width,
  };

  return createPortal(
    <div
      ref={panelRef}
      role="tooltip"
      className={cn(PANEL_CLASS, className)}
      style={style}
      onPointerEnter={() => {
        freezeCalendarHover();
      }}
      onPointerLeave={(event) => {
        const date = resolveCalendarDateUnderPoint(
          event.clientX,
          event.clientY,
        );
        const nextDay =
          date != null
            ? days.find((entry) => getDate(entry) === date)
            : undefined;

        if (date != null && nextDay != null && hasContent(nextDay)) {
          resolveCalendarHover(date, event.clientX, event.clientY);
          return;
        }

        resolveCalendarHover(null, event.clientX, event.clientY);
      }}
    >
      {renderContent(day)}
    </div>,
    document.body,
  );
}
