/**
 * @file widgets/world-time/ui/world-time-city-guide.tsx
 * Full-height vertical guide aligned to a city’s map X position.
 *
 * Purpose: Highlight a hovered or locked city across the World Time shell.
 * Used in: widgets/world-time/ui/world-time.tsx
 */

import type { WorldTimeCity } from "@/widgets/world-time/lib/cities";

/**
 * Props for {@link WorldTimeCityGuide}.
 */
export interface WorldTimeCityGuideProps {
  /** City whose map `x` anchors the guide; `null` hides it. */
  city: WorldTimeCity | null;
}

/**
 * Absolute vertical line through the widget, centered on `city.x`.
 *
 * Parent section must be `relative`. Horizontal inset matches section `p-2`
 * so `%` lines up with map marker coordinates.
 *
 * @param props - city to highlight, or null
 */
export function WorldTimeCityGuide({ city }: WorldTimeCityGuideProps) {
  if (city === null) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-2 inset-y-0 z-0"
    >
      <div
        className="absolute top-0 h-[75%] w-4 opacity-20 -translate-x-1/2 border-x-2 border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)50%,transparent)]"
        style={{ left: `${city.x}%` }}
      />
    </div>
  );
}
