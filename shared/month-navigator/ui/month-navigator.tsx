/**
 * @file shared/month-navigator/ui/month-navigator.tsx
 * Reusable previous / month label / next control row.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMonthLabel } from "@/shared/month-navigator/lib/month-key";

/**
 * Props for the month navigator control.
 */
export interface MonthNavigatorProps {
  /** Current month key (`YYYY-MM`). */
  month: string;
  /** Called when the user moves to the previous month. */
  onPrevious: () => void;
  /** Called when the user moves to the next month. */
  onNext: () => void;
  /** Optional wrapper class name. */
  className?: string;
}

/**
 * Renders previous, month label, and next controls for month-based views.
 *
 * @param props - month value and navigation callbacks
 * @returns month navigator UI
 */
export function MonthNavigator({
  month,
  onPrevious,
  onNext,
  className,
}: MonthNavigatorProps) {
  const monthLabel = formatMonthLabel(month);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-3 py-2 shadow-sm",
        className,
      )}
      aria-label={`Month navigation, ${monthLabel}`}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous month"
        onClick={onPrevious}
      >
        <ChevronLeft />
      </Button>

      <p className="min-w-0 flex-1 text-center text-sm font-medium [color:var(--color-fg)]">
        {monthLabel}
      </p>

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next month"
        onClick={onNext}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
