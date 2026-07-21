/**
 * @file views/home/ui/home-reminder-quick-add.tsx
 * Home quick-add control — bell icon opens the reminder create drawer.
 *
 * Purpose: Let users create a reminder from Home without visiting `/reminders`.
 * Used in: views/home/index.tsx (Today's Reminders header row)
 * Used for: openCreate → ActivityDrawer kind="reminder".
 *
 * Function Index:
 * - HomeReminderQuickAdd — drawer controller + Bell button + ActivityDrawer
 *
 * Steps:
 * 1. Own definition drawer controller (create from Home).
 * 2. Render icon button with plus badge + ActivityDrawer island.
 */

"use client";

import { useCallback } from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActivityDrawer } from "@/features/activity/activity-drawer";
import { useActivityDefinitionDrawer } from "@/features/activity/activity-page";
import { HomeQuickAddIcon } from "@/views/home/ui/home-quick-add-icon";

/**
 * Compact bell-icon button that opens ActivityDrawer in create mode for reminders.
 */
export function HomeReminderQuickAdd() {
  /////////////////////////////////
  // 1. Drawer — create from Home; edit after first save via orchestrator
  const drawer = useActivityDefinitionDrawer();
  const { openCreate } = drawer;

  const handleAddReminder = useCallback(() => {
    openCreate();
  }, [openCreate]);

  /////////////////////////////////
  // 2. Icon + editor island
  return (
    <>
      <Button
        aria-label="Add reminder"
        className="shrink-0"
        size="icon"
        title="Add reminder"
        type="button"
        variant="ghost"
        onClick={handleAddReminder}
      >
        <HomeQuickAddIcon>
          <Bell
            aria-hidden
            className="h-4 w-4 [color:var(--color-fg-muted)]"
          />
        </HomeQuickAddIcon>
      </Button>

      <ActivityDrawer drawer={drawer} kind="reminder" />
    </>
  );
}
