/**
 * @file widgets/world-time/ui/world-time-map.tsx
 * Globe image with absolute city dots.
 *
 * Purpose: Render the world map and overlay calibrated city markers.
 * Used in: widgets/world-time/ui/world-time.tsx
 */

import { WORLD_TIME_CITIES } from "@/widgets/world-time/lib/cities";
import { WorldTimeMarker } from "@/widgets/world-time/ui/world-time-marker";

/**
 * Renders the globe map with absolute city dots (no labels).
 */
export function WorldTimeMap() {
  return (
    <div className="-mb-4 relative w-full overflow-visible rounded-xl border-0 border-[var(--color-border)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static public asset; no layout shift sizing needed yet */}
      <img
        src="/images/globe.webp"
        alt=""
        draggable={false}
        className="block h-auto w-full select-none rounded-xl opacity-20"
      />

      <ul className="absolute inset-0 m-0 list-none p-0" aria-label="City locations">
        {WORLD_TIME_CITIES.map(function renderMarker(city) {
          return <WorldTimeMarker key={city.timeZone} city={city} />;
        })}
      </ul>
    </div>
  );
}
