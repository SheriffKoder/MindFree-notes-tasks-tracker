/**
 * @file views/home/ui/home-today-priority-list.tsx
 * Renders Home Today rows grouped by priority (non-collapsible sections).
 *
 * Purpose: Shared composition for Today's Tasks and Today's Reminders lists.
 *          Section labels align with the parent "Today's …" summary text.
 * Used in: home-today-list.tsx, home-reminders-list.tsx
 */

"use client";

import type { TodayActivity } from "@/entities/activity";
import { QuickRecordCard } from "@/features/activity/quick-record";
import { cn } from "@/lib/utils";
import { groupTodayByPriority } from "@/views/home/lib/group-today-by-priority";
import {
  HOME_PRIORITY_LABEL_INSET_CLASS,
  HOME_SECTION_HEADER_CLASS,
} from "@/views/home/lib/section-header-class";

export interface HomeTodayPriorityListProps {
  items: TodayActivity[];
}

/**
 * Renders High → Medium → Low → Other sections; omits empty buckets.
 */
export function HomeTodayPriorityList({ items }: HomeTodayPriorityListProps) {
  const sections = groupTodayByPriority(items);

  return (
    <div className="flex min-h-24 flex-col gap-1">
      {sections.map((section) => (
        <section key={section.key} className="flex flex-col gap-0.5">
          <p
            className={cn(
              HOME_SECTION_HEADER_CLASS,
              HOME_PRIORITY_LABEL_INSET_CLASS,
              "py-1",
            )}
          >
            {section.label}
          </p>
          {section.items.map((item) => (
            <QuickRecordCard key={item.activity.id} today={item} />
          ))}
        </section>
      ))}
    </div>
  );
}
