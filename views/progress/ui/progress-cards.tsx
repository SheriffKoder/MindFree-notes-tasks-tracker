/**
 * @file views/progress/ui/progress-cards.tsx
 * Async Server Component that loads and grids Progress task cards.
 *
 * Purpose: Authenticate, assemble `ProgressPageData` for the selected month,
 *          and render `ActivityProgressCard` rows via `ListView`. No client
 *          boundary — Progress is pure SSR.
 * Used in: `views/progress/ui/progress-view.tsx` (under Suspense).
 * Used for: The Progress page report body.
 */

import { connection } from "next/server";

import {
  getAuthenticatedUserId,
  getProgressPageData,
} from "@/entities/activity/server";
import type { ProgressTask } from "@/entities/activity";
import { ActivityProgressCard } from "@/features/activity/activity-progress-card";
import { getTodayIsoDate } from "@/shared/calendar";
import { ListView } from "@/shared/list-view";
import { ProgressEmptyState } from "@/views/progress/ui/progress-empty-state";

export interface ProgressCardsProps {
  /** Resolved month key (`YYYY-MM`). */
  month: string;
}

function getProgressTaskKey(task: ProgressTask): string {
  return task.id;
}

function renderProgressTask(task: ProgressTask) {
  return <ActivityProgressCard task={task} />;
}

/**
 * Loads Progress page data and renders the responsive card grid.
 *
 * @param props - selected month
 */
export async function ProgressCards({ month }: ProgressCardsProps) {
  // Dynamic request boundary before resolving local "today".
  await connection();

  const userId = await getAuthenticatedUserId();
  const todayIso = getTodayIsoDate();
  const page = await getProgressPageData(userId, month, todayIso);

  if (page.tasks.length === 0) {
    return <ProgressEmptyState />;
  }

  return (
    <ListView
      items={page.tasks}
      getKey={getProgressTaskKey}
      renderItem={renderProgressTask}
    />
  );
}
