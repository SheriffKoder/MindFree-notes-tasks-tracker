/**
 * @file shared/incrementer/ui/incrementer.tsx
 * Compact − / + stepper with a value display that is read-only by default and
 * optionally editable (`editable`) as a typable numeric input.
 *
 * Purpose: Adjust a numeric count via steppers, or free-text when `editable`.
 * Used in: entities/activity/editor (goal, yearly day/month), home (later).
 */

"use client";

import { Minus, Plus } from "lucide-react";
import type { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type IncrementerOrientation = "row" | "column";

export interface IncrementerProps {
  /** Current value, or `null` when cleared (optional counts). */
  value: number | null;
  onChange: (value: number | null) => void;
  /** Inclusive lower bound when the value is set. Defaults to `1`. */
  min?: number;
  /** Inclusive upper bound. Unlimited when omitted. */
  max?: number;
  /** Amount applied per click. Defaults to `1`. */
  step?: number;
  /**
   * When true, decrementing at `min` clears to `null`, and incrementing from
   * `null` starts at `min`.
   */
  allowNull?: boolean;
  /** Label shown when `value` is `null`. Defaults to `—`. */
  emptyLabel?: string;
  /**
   * `row` — `{value} {− | +}` (default).
   * `column` — `+` / value / `−` stacked with separators.
   */
  orientation?: IncrementerOrientation;
  /**
   * `text` — plain value (default).
   * `boxed` — value shown as a filled input-like box sized for ~2 digits.
   * Only affects `row` orientation.
   */
  valueVariant?: "text" | "boxed";
  /**
   * When true, the value renders as a typable numeric input (row orientation
   * only) in addition to the − / + steppers. Digits are clamped to
   * `[min, max]`; clearing yields `null` when `allowNull`.
   */
  editable?: boolean;
  disabled?: boolean;
  className?: string;
  /** Accessible name for the control group. */
  "aria-label"?: string;
}

/**
 * Renders a borderless stepper — separator only between − and +.
 */
export function Incrementer({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  allowNull = false,
  emptyLabel = "—",
  orientation = "row",
  valueVariant = "text",
  editable = false,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Adjust value",
}: IncrementerProps) {
  const isColumn = orientation === "column";

  const canDecrement =
    !disabled &&
    (value === null ? false : allowNull ? true : value > min);

  const canIncrement =
    !disabled && (value === null || max === undefined || value + step <= max);

  const handleDecrement = () => {
    if (value === null) {
      return;
    }

    const next = value - step;

    if (next < min) {
      if (allowNull) {
        onChange(null);
      }

      return;
    }

    onChange(next);
  };

  const handleIncrement = () => {
    if (value === null) {
      onChange(min);
      return;
    }

    const next = value + step;

    if (max !== undefined && next > max) {
      return;
    }

    onChange(next);
  };

  const display = value === null ? emptyLabel : value;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "");

    if (digits === "") {
      onChange(allowNull ? null : min);
      return;
    }

    let next = Number.parseInt(digits, 10);

    if (max !== undefined && next > max) {
      next = max;
    }

    if (next < min) {
      next = min;
    }

    onChange(next);
  };

  const valueClass = cn(
    "tabular-nums [color:var(--color-fg)]",
    isColumn
      ? "min-w-[1.75rem] text-center text-sm"
      : valueVariant === "boxed"
        ? "min-w-[2.5rem] rounded-md px-1.5 py-0.5 text-center text-sm [background-color:var(--color-surface-secondary)]"
        : "min-w-[1.5rem] text-right text-sm",
  );

  const inputClass = cn(
    "w-[calc(3ch+1.25rem)] rounded border border-[var(--color-border)] bg-transparent px-2 py-0.5 text-right text-sm tabular-nums [color:var(--color-fg)] outline-none",
    "focus-visible:[border-color:color-mix(in_srgb,var(--color-accent)_60%,var(--color-border))]",
    "disabled:cursor-not-allowed disabled:opacity-50",
  );

  const buttonClass = cn(
    "border-0",
    isColumn ? "h-6 w-7" : "h-7 w-7",
  );

  const separatorClass = isColumn
    ? "h-px w-5 shrink-0 [background-color:var(--color-border)]"
    : "h-4 w-px shrink-0 [background-color:var(--color-border)]";

  const controls = (
    <div
      className={cn(
        "inline-flex items-center",
        isColumn ? "flex-col" : "flex-row",
      )}
    >
      {isColumn ? (
        <>
          <Button
            aria-label="Increase"
            className={buttonClass}
            disabled={!canIncrement}
            size="icon"
            type="button"
            variant="ghost"
            onClick={handleIncrement}
          >
            <Plus aria-hidden className="h-3.5 w-3.5" />
          </Button>
          <span aria-hidden className={separatorClass} />
          <span aria-live="polite" className={cn(valueClass, "py-0.5")}>
            {display}
          </span>
          <span aria-hidden className={separatorClass} />
          <Button
            aria-label="Decrease"
            className={buttonClass}
            disabled={!canDecrement}
            size="icon"
            type="button"
            variant="ghost"
            onClick={handleDecrement}
          >
            <Minus aria-hidden className="h-3.5 w-3.5" />
          </Button>
        </>
      ) : (
        <>
          <Button
            aria-label="Decrease"
            className={buttonClass}
            disabled={!canDecrement}
            size="icon"
            type="button"
            variant="ghost"
            onClick={handleDecrement}
          >
            <Minus aria-hidden className="h-3.5 w-3.5" />
          </Button>
          <span aria-hidden className={separatorClass} />
          <Button
            aria-label="Increase"
            className={buttonClass}
            disabled={!canIncrement}
            size="icon"
            type="button"
            variant="ghost"
            onClick={handleIncrement}
          >
            <Plus aria-hidden className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );

  if (isColumn) {
    return (
      <div
        aria-label={ariaLabel}
        className={cn("inline-flex flex-col items-center", className)}
        role="group"
      >
        {controls}
      </div>
    );
  }

  return (
    <div
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-2", className)}
      role="group"
    >
      {editable ? (
        <input
          aria-label={ariaLabel}
          className={inputClass}
          disabled={disabled}
          inputMode="numeric"
          value={value === null ? "" : String(value)}
          onChange={handleInputChange}
        />
      ) : (
        <span aria-live="polite" className={valueClass}>
          {display}
        </span>
      )}
      {controls}
    </div>
  );
}
