/**
 * @file widgets/world-time/ui/world-time-scrub-slider.tsx
 * Presentational hour scrub bar for a locked World Time city.
 *
 * Purpose: Show `CODE [====●====] ×` with sparse hour ticks; no Date/zone logic.
 * Used in: widgets/world-time/ui/world-time.tsx
 */

"use client";

import { X } from "lucide-react";

import {
  formatScrubHourLabel,
  SCRUB_HOUR_LABEL_HOURS,
} from "@/widgets/world-time/lib/format-scrub-hour-label";

import "./world-time-scrub-slider.css";

/** Equal side gutters so the track stays centered between code and close. */
const SIDE_SLOT_CLASS = "flex w-8 shrink-0 items-start justify-center";

/** Max hour on the scrub range (0–23). */
const SCRUB_HOUR_MAX = 23;

/**
 * Props for {@link WorldTimeScrubSlider}.
 */
export interface WorldTimeScrubSliderProps {
  /** When true, slider is visible and interactive. */
  open: boolean;
  /** Locked city two-letter code (e.g. `LA`). */
  cityCode: string;
  /** Selected hour in the locked zone (0–23). */
  value: number;
  /** Fired when the thumb moves to a new whole hour. */
  onChange: (hour: number) => void;
  /** Fired when the close control is pressed. */
  onClose: () => void;
}

/**
 * Absolute top scrub bar: city code, range, ticks, and close.
 *
 * Range + labels share one track width; label inset matches the thumb path.
 *
 * @param props - open state, value, and callbacks
 */
export function WorldTimeScrubSlider({
  open,
  cityCode,
  value,
  onChange,
  onClose,
}: WorldTimeScrubSliderProps) {
  return (
    <div
      className={
        open
          ? "pointer-events-auto absolute inset-x-0 top-0 z-10 translate-y-0 rounded-t-xl border-b border-[var(--color-border)] bg-transparent px-2 py-2.5 opacity-100 backdrop-blur-md transition-[opacity,transform] duration-200 ease-out"
          : "pointer-events-none absolute inset-x-0 top-0 z-10 -translate-y-full rounded-t-xl border-b border-[var(--color-border)] bg-transparent px-2 py-2.5 opacity-0 backdrop-blur-md transition-[opacity,transform] duration-200 ease-out"
      }
      aria-hidden={!open}
    >
      <div className="flex items-start gap-2">
        <div className={SIDE_SLOT_CLASS}>
          <span
            className="pt-[3px] text-caption font-medium [color:var(--color-fg-muted)]"
            aria-hidden="true"
          >
            {cityCode || "—"}
          </span>
        </div>

        <div className="world-time-scrub-track flex min-w-0 flex-1 flex-col gap-1.5 pt-2">
          <input
            type="range"
            min={0}
            max={SCRUB_HOUR_MAX}
            step={1}
            value={value}
            disabled={!open}
            aria-label={
              cityCode
                ? `Hour in ${cityCode}`
                : "Hour scrubber"
            }
            aria-valuetext={formatScrubHourLabel(value)}
            className="world-time-scrub-range"
            onChange={function handleHourChange(event) {
              onChange(Number(event.target.value));
            }}
          />

          <div className="world-time-scrub-labels" aria-hidden="true">
            {SCRUB_HOUR_LABEL_HOURS.map(function renderHourTick(hour) {
              return (
                <span
                  key={hour}
                  className="world-time-scrub-label"
                  style={{ left: `${(hour / SCRUB_HOUR_MAX) * 100}%` }}
                >
                  {formatScrubHourLabel(hour)}
                </span>
              );
            })}
          </div>
        </div>

        <div className={SIDE_SLOT_CLASS}>
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            aria-label="Close time scrubber"
            className="inline-flex size-6 items-center justify-center rounded-md [color:var(--color-fg-muted)] transition-colors hover:[color:var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            onClick={onClose}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
