/**
 * @file widgets/uptime/ui/uptime-clock.tsx
 * Uptime-styled analog clock — fixed face, moving hands.
 *
 * Purpose: Render the decorative clock for the Home aside.
 * Used in: views/home/ui/home-aside-content.tsx
 * Source visual: app/development/uptime-main (hands move; face stays fixed)
 *
 * Hands snap once per second — no sub-second animation.
 */

"use client";

import { useId, useRef } from "react";

import { cn } from "@/lib/utils";
import { ROMAN_HOUR_LABELS } from "@/widgets/uptime/lib/roman-hours";
import { useUptimeHands } from "@/widgets/uptime/model/use-uptime-hands";

/**
 * Props for {@link UptimeClock}.
 */
export interface UptimeClockProps {
  /** Show arabic second/minute numbers instead of tick marks. */
  numbered?: boolean;
  /** When false, the second hand is omitted. Defaults to true. */
  showSeconds?: boolean;
  className?: string;
}

/**
 * Renders an analog clock with a fixed dial and live hands.
 *
 * @param props - numbered / seconds toggles and optional className
 */
export function UptimeClock({
  numbered = false,
  showSeconds = true,
  className,
}: UptimeClockProps) {
  const reactId = useId();
  const pathId = `uptime-path-${reactId.replace(/:/g, "")}`;

  const hourHandRef = useRef<SVGGElement>(null);
  const minuteHandRef = useRef<SVGGElement>(null);
  const secondHandRef = useRef<SVGGElement>(null);

  useUptimeHands({
    hourHandRef,
    minuteHandRef,
    secondHandRef: showSeconds ? secondHandRef : undefined,
  });

  return (
    <svg
      role="img"
      aria-label="Analog clock"
      className={cn("block h-auto w-full [color:var(--color-fg)]", className)}
      viewBox="0 0 100 100"
    >
      <defs>
        <path
          id={pathId}
          d="M50,12a38,38 0 1,1 0,76a38,38 0 1,1 0,-76"
        />
      </defs>

      {/* Fixed face — roman hours + tick rings stay put. */}
      <text
        fill="currentColor"
        fontFamily="sans-serif"
        fontSize={5}
        letterSpacing={-0.4}
        textAnchor="middle"
      >
        {ROMAN_HOUR_LABELS.map(function renderHourLabel(label, index) {
          return (
            <textPath
              key={`${label}-${index}`}
              href={`#${pathId}`}
              startOffset={`${(index / 12) * 100}%`}
            >
              {label}
            </textPath>
          );
        })}
      </text>

      <g>
        {Array.from({ length: 60 }, function renderSecondMark(_value, index) {
          if (numbered && index % 5 === 0) {
            return (
              <text
                key={`s-num-${index}`}
                fontFamily="sans-serif"
                fontSize={2}
                textAnchor="middle"
                transform={`rotate(${index * 6} 50 50)`}
                x={50}
                y={2}
              >
                {index}
              </text>
            );
          }

          return (
            <path
              key={`s-mark-${index}`}
              d={`M 50 2 V ${index % 5 ? 1 : 0}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.3}
              transform={`rotate(${index * 6} 50 50)`}
            />
          );
        })}
      </g>

      <g>
        {Array.from({ length: 60 }, function renderMinuteMark(_value, index) {
          if (numbered && index % 5 === 0) {
            return (
              <text
                key={`m-num-${index}`}
                fontFamily="sans-serif"
                fontSize={3}
                textAnchor="middle"
                transform={`rotate(${index * 6} 50 50)`}
                x={50}
                y={5}
              >
                {index}
              </text>
            );
          }

          return (
            <path
              key={`m-mark-${index}`}
              d={`M 50 3 V ${index % 5 ? 4 : 6}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
              transform={`rotate(${index * 6} 50 50)`}
            />
          );
        })}
      </g>

      {/* Hands — drawn at 12 o’clock, rotated to the current time. */}
      <g ref={hourHandRef}>
        <path
          d="M50 25 V50"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={2}
        />
      </g>
      <g ref={minuteHandRef}>
        <path
          d="M50 14 V50"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={1}
        />
      </g>
      {showSeconds ? (
        <g ref={secondHandRef}>
          <path
            d="M50 3 V50"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={0.5}
          />
        </g>
      ) : null}
    </svg>
  );
}
