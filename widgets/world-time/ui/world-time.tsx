/**
 * @file widgets/world-time/ui/world-time.tsx
 * World Time widget — globe dots, scrub slider, and city-time grid.
 *
 * Purpose: Show selected cities’ locations and local times in the Home aside.
 * Used in: views/home/ui/home-aside-content.tsx
 */

"use client";

import { useState } from "react";

import { WORLD_TIME_CITIES } from "@/widgets/world-time/lib/cities";
import { useMinuteClock } from "@/widgets/world-time/model/use-minute-clock";
import { useWorldTimeScrub } from "@/widgets/world-time/model/use-world-time-scrub";
import { WorldTimeCityGuide } from "@/widgets/world-time/ui/world-time-city-guide";
import { WorldTimeCityTimesGrid } from "@/widgets/world-time/ui/world-time-city-times-grid";
import { WorldTimeGmtGrid } from "@/widgets/world-time/ui/world-time-gmt-grid";
import { WorldTimeMap } from "@/widgets/world-time/ui/world-time-map";
import { WorldTimeScrubSlider } from "@/widgets/world-time/ui/world-time-scrub-slider";

/**
 * Resolve the city for the vertical guide: hover wins, else locked.
 *
 * @param hoveredCode - city under pointer/focus, if any
 * @param lockedCode - scrub-locked city code, if any
 */
function resolveGuideCity(hoveredCode: string | null, lockedCode?: string) {
  const code = hoveredCode ?? lockedCode;
  if (code === undefined || code === "") {
    return null;
  }

  return (
    WORLD_TIME_CITIES.find(function findGuideCity(city) {
      return city.code === code;
    }) ?? null
  );
}

/**
 * Renders the World Time scrub bar, map, and city-times grid.
 */
export function WorldTime() {
  const realNow = useMinuteClock();
  const scrub = useWorldTimeScrub(realNow);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const guideCity = resolveGuideCity(hoveredCode, scrub.lockedCity?.code);

  return (
    <section
      aria-label="World time"
      className="relative flex flex-col gap-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2"
    >
      <WorldTimeCityGuide city={guideCity} />
      <WorldTimeScrubSlider
        open={scrub.lockedCity !== null}
        cityCode={scrub.lockedCity?.code ?? ""}
        value={scrub.sliderHour}
        onChange={scrub.setSliderHour}
        onClose={scrub.close}
      />
      <div className="relative z-[1]">
        <WorldTimeMap lockedCode={scrub.lockedCity?.code} />
      </div>
      {/* <WorldTimeGmtGrid now={scrub.viewInstant} /> */}
      <WorldTimeCityTimesGrid
        now={scrub.viewInstant}
        lockedCode={scrub.lockedCity?.code}
        onSelectCity={scrub.selectCity}
        onHoverCity={function handleHoverCity(city) {
          setHoveredCode(city.code);
        }}
        onLeaveCity={function handleLeaveCity() {
          setHoveredCode(null);
        }}
      />
    </section>
  );
}
