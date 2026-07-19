/**
 * @file views/reminders/ui/reminders-client.tsx
 * Thin Reminders wrapper over the shared activity page composition.
 */

"use client";

import { ActivityPageClient } from "@/features/activity/activity-page";

/**
 * Renders the Reminders page via the shared kind-parameterized activity client.
 */
export function RemindersClient() {
  return (
    <ActivityPageClient
      kind="reminder"
      subtitle="Browse scheduled reminders by month. Configure a reminder, then mark it done for a day."
      title="Reminders"
    />
  );
}
