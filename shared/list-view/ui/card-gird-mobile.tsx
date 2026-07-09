/**
 * @file shared/list-view/ui/card-gird-mobile.tsx
 * Mobile card grid layout (single column).
 */

import { ChevronDown } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { formatWeekRangeLabel } from "@/shared/list-view/lib/format-week-date-label";
import {
  groupItemsByWeekInMonth,
  type WeekInMonthGroup,
} from "@/shared/list-view/lib/group-by-week-in-month";

export interface CardGirdMobileProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  className?: string;
  /** When true, groups items by calendar week (requires `month` and `groupByWeekKey`). */
  groupByWeek?: boolean;
  /** Item property key holding the ISO date (`YYYY-MM-DD`), e.g. `"date"`. */
  groupByWeekKey?: string;
  /** Whether week sections start expanded. Default `true`. */
  defaultOpen?: boolean;
  /** Month key (`YYYY-MM`) used for week boundaries. */
  month?: string;
}

function renderFlatItems<T>({
  items,
  renderItem,
  getKey,
}: Pick<CardGirdMobileProps<T>, "items" | "renderItem" | "getKey">) {
  return items.map((item) => (
    <div key={getKey(item)}>{renderItem(item)}</div>
  ));
}

interface WeekGroupSectionProps<T> {
  week: WeekInMonthGroup<T>;
  weekIndex: number;
  defaultOpen: boolean;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}

function WeekGroupSection<T>({
  week,
  weekIndex,
  defaultOpen,
  getKey,
  renderItem,
}: WeekGroupSectionProps<T>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group"
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-[11px] leading-tight [color:var(--color-fg-muted)] marker:content-none [&::-webkit-details-marker]:hidden",
          weekIndex > 0 && "border-t border-[var(--color-border)]",
        )}
      >
        <span>
          W{week.weekNumber}: {formatWeekRangeLabel(week.rangeStart, week.rangeEnd)}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="flex flex-col gap-3 pb-1 pt-3">
        {week.items.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))}
      </div>
    </details>
  );
}

function renderWeekGroupedItems<T>({
  items,
  renderItem,
  getKey,
  month,
  groupByWeekKey,
  defaultOpen,
}: Required<
  Pick<CardGirdMobileProps<T>, "items" | "renderItem" | "getKey" | "month" | "groupByWeekKey">
> &
  Pick<CardGirdMobileProps<T>, "defaultOpen">) {
  const { weeks, ungrouped } = groupItemsByWeekInMonth(items, month, groupByWeekKey);

  return (
    <>
      {weeks.map((week, weekIndex) => (
        <WeekGroupSection
          key={`${week.rangeStart}-${week.rangeEnd}`}
          week={week}
          weekIndex={weekIndex}
          defaultOpen={defaultOpen ?? true}
          getKey={getKey}
          renderItem={renderItem}
        />
      ))}
      {ungrouped.length > 0 ? (
        <section className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-3">
          <p className="text-[11px] leading-tight [color:var(--color-fg-muted)]">
            Outside {month}
          </p>
          {ungrouped.map((item) => (
            <div key={getKey(item)}>{renderItem(item)}</div>
          ))}
        </section>
      ) : null}
    </>
  );
}

export function CardGirdMobile<T>({
  items,
  renderItem,
  getKey,
  className,
  groupByWeek = false,
  groupByWeekKey,
  defaultOpen = true,
  month,
}: CardGirdMobileProps<T>) {
  const canGroupByWeek = groupByWeek && month && groupByWeekKey;

  const content = useMemo(() => {
    if (canGroupByWeek) {
      return renderWeekGroupedItems({
        items,
        renderItem,
        getKey,
        month,
        groupByWeekKey,
        defaultOpen,
      });
    }

    return renderFlatItems({ items, renderItem, getKey });
  }, [canGroupByWeek, defaultOpen, getKey, groupByWeekKey, items, month, renderItem]);

  return (
    <div key={canGroupByWeek ? month : undefined} className={cn("flex flex-col gap-3", className)}>
      {content}
    </div>
  );
}
