/**
 * @file widgets/world-time/ui/world-time.tsx
 * World Time widget — globe dots plus separate GMT and city-time grids.
 *
 * Purpose: Show selected cities’ locations and local times in the Home aside.
 * Used in: views/home/ui/home-aside-content.tsx
 */

"use client";

import { useMinuteClock } from "@/widgets/world-time/model/use-minute-clock";
import { WorldTimeCityTimesGrid } from "@/widgets/world-time/ui/world-time-city-times-grid";
import { WorldTimeGmtGrid } from "@/widgets/world-time/ui/world-time-gmt-grid";
import { WorldTimeMap } from "@/widgets/world-time/ui/world-time-map";

/**
 * Renders the World Time map (dots), then GMT grid, then city-times grid.
 */
export function WorldTime() {
  const now = useMinuteClock();

  return (
    <section aria-label="World time" className="flex flex-col gap-0 relative border border-[var(--color-border)] rounded-xl p-2 bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)]">

      <WorldTimeMap />
      {/* <WorldTimeGmtGrid now={now} /> */}
      <WorldTimeCityTimesGrid now={now} />
    </section>
  );
}
