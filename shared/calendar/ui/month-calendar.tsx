/**
 * @file shared/calendar/ui/month-calendar.tsx
 * Reusable month calendar grid with a renderCell callback.
 */

"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import {
  buildMonthGrid,
  formatDayAriaLabel,
  formatMonthAriaLabel,
  WEEKDAY_LABELS,
} from "@/shared/calendar/lib/month-grid";
import { getTodayIsoDate } from "@/shared/calendar/lib/today";
import type { InMonthDay, MonthCalendarProps } from "@/shared/calendar/model/types";

const frameClassName =
  "w-full max-w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]";
const headerCellClassName =
  "flex min-h-8 min-w-0 items-center justify-center border-r border-[var(--color-border)] px-1 py-2 text-center text-caption [color:var(--color-fg-muted)] last:border-r-0";
/** Equal columns that cannot grow past 1/7 of the grid — long cell content stays clipped/wrapped inside. */
const gridClassName =
  "grid w-full grid-cols-[repeat(7,minmax(0,1fr))] divide-x divide-y divide-[var(--color-border)]";
const paddingCellClassName =
  "flex min-h-16 min-w-0 items-start overflow-hidden bg-[color-mix(in_srgb,var(--color-surface-secondary)_55%,var(--color-surface))] p-1.5 text-caption [color:var(--color-fg-muted)] md:min-h-20";
const inMonthCellClassName =
  "flex min-h-16 min-w-0 max-w-full overflow-hidden w-full cursor-pointer items-stretch bg-[var(--color-surface)] p-0 text-left md:min-h-20";

/**
 * Renders a month calendar matrix with weekday headers and a renderCell slot.
 *
 * @param props - month data, selection state, and cell renderer
 * @returns calendar grid UI
 */
export function MonthCalendar<TDay extends InMonthDay>({
  month,
  calendarDays,
  selectedDate,
  onDaySelect,
  renderCell,
  todayIso: todayIsoProp,
  className,
}: MonthCalendarProps<TDay>) {
  const cells = useMemo(
    () => buildMonthGrid(month, calendarDays),
    [month, calendarDays],
  );
  // One local-time resolution per grid render — not per cell.
  const todayIso = todayIsoProp ?? getTodayIsoDate();
  const monthLabel = formatMonthAriaLabel(month);

  return (
    <div className={cn(frameClassName, className)}>
      <div
        className="grid w-full grid-cols-[repeat(7,minmax(0,1fr))] border-b border-[var(--color-border)]"
        aria-hidden
      >
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className={headerCellClassName}>
            {label}
          </div>
        ))}
      </div>

      <div
        role="grid"
        aria-label={`Calendar for ${monthLabel}`}
        className={gridClassName}
      >
        {cells.map((cell) => {
          if (cell.kind === "padding") {
            const isToday = cell.date === todayIso;

            return (
              <div
                key={cell.date}
                role="gridcell"
                aria-disabled="true"
                aria-label={formatDayAriaLabel(cell.date)}
                className={paddingCellClassName}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center",
                    isToday &&
                      "rounded-full bg-[var(--color-accent)] [color:var(--color-bg)]",
                  )}
                >
                  {cell.day}
                </span>
              </div>
            );
          }

          const { day } = cell;
          const isSelected = selectedDate === day.date;
          const isToday = day.date === todayIso;
          const dayLabel = formatDayAriaLabel(day.date);

          return (
            <button
              key={day.date}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={dayLabel}
              className={inMonthCellClassName}
              onClick={() => onDaySelect(day.date)}
            >
              {renderCell(day, { isToday })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
