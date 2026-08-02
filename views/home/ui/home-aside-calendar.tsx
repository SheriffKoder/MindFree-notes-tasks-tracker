/**
 * @file views/home/ui/home-aside-calendar.tsx
 * Home aside month calendar — browse-only wrap of `components/calendar`.
 *
 * Purpose: Show the shared month calendar above World Time; days are not
 *          selectable here (month/year navigation stays interactive).
 * Used in: views/home/ui/home-aside-content.tsx
 *
 * Note: Day picking remains enabled in other DateSelectorSimple call sites;
 *       this view only disables the day grid via scoped CSS.
 */

"use client";

import DateSelectorSimple from "@/components/calendar/calendar";
import { useTodayIsoDate } from "@/shared/demo-session";

/**
 * Renders a browse-only month calendar for the Home right aside.
 *
 * Highlights the app “today” (demo-aware). Day cells ignore pointer events so
 * the shared picker’s selection behavior is unchanged elsewhere.
 */
export function HomeAsideCalendar() {
  const todayIso = useTodayIsoDate();

  /////////////////////////////////////////////////////////////
  // Required by DateSelectorSimple; day grid is non-interactive in this view.
  function ignoreDayPick() {
    // no-op — aside calendar is display / month-browse only
  }

  return (
    <DateSelectorSimple
      className="w-full overflow-hidden [&_.rdrCalendarWrapper]:max-w-full [&_.rdrMonthAndYearWrapper]:pb-1 [&_.rdrMonthName]:hidden [&_.rdrDays]:pointer-events-none [&_.rdrDays]:select-none"
      selectedEndDate={todayIso}
      selectedStartDate={todayIso}
      onDateChange={ignoreDayPick}
    />
  );
}
