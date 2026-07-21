/**
 * @file views/home/index.tsx
 * Home dashboard composition for the protected MindFree landing route.
 */

import { BookMarked, ChevronRight } from "lucide-react";

import type { AuthNotice } from "@/features/auth/model/auth-notice";
import { AuthNoticeBanner } from "@/features/auth/ui/auth-notice-banner";
import { cn } from "@/lib/utils";
import { HomeAsideShell } from "@/views/home/model/home-aside-drawer-context";
import { HomeActivityRealtime } from "@/views/home/ui/home-activity-realtime";
import { HomeAsideContent } from "@/views/home/ui/home-aside-content";
import { HomeHeaderToolbar } from "@/views/home/ui/home-header-toolbar";
import { HomeNotesSection } from "@/views/home/ui/home-notes-section";
import { HomeRemindersList } from "@/views/home/ui/home-reminders-list";
import { HomeRightAside } from "@/views/home/ui/home-right-aside";
import { HOME_SECTION_HEADER_CLASS } from "@/views/home/lib/section-header-class";
import { HomeTodayList } from "@/views/home/ui/home-today-list";

export { HomeHydrationSeed } from "@/views/home/ui/home-hydration-seed";

/**
 * Props for the protected home dashboard.
 */
export interface HomeViewProps {
  /** Optional protected-route auth notice shown above the dashboard cards. */
  notice?: AuthNotice | null;
}

/**
 * Renders the initial protected home dashboard composition.
 *
 * @param props - notice configuration for protected auth states
 * @returns Home dashboard scaffold for starred notes, tasks, and reminders
 */
export function HomeView({ notice = null }: HomeViewProps) {
  return (
    <HomeAsideShell>
      <div className="mx-auto flex h-full w-full flex-col gap-4">
        <HomeActivityRealtime />
        <section className="flex shrink-0 items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-h2 flex items-center gap-2">
              <BookMarked aria-hidden className="h-6 w-6" /> MindFree
            </h2>
          </div>

          <HomeHeaderToolbar />
        </section>

        {notice ? <AuthNoticeBanner notice={notice} /> : null}

        <div className="flex min-h-0 flex-1 flex-row gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <section>
              <div className="mb-2 flex flex-col">
                <h2 className={HOME_SECTION_HEADER_CLASS}>Starred Notes</h2>
              </div>
              <HomeNotesSection />
            </section>

            <details open className="group/today">
              <summary
                className={cn(
                  HOME_SECTION_HEADER_CLASS,
                  "flex w-fit cursor-pointer list-none items-center gap-1.5 py-1 marker:content-none [&::-webkit-details-marker]:hidden",
                )}
              >
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-open/today:rotate-90"
                />
                <span>Today&apos;s Tasks</span>
              </summary>
              <div className="mt-1">
                <HomeTodayList />
              </div>
            </details>

            <details open className="group/reminders">
              <summary
                className={cn(
                  HOME_SECTION_HEADER_CLASS,
                  "flex w-fit cursor-pointer list-none items-center gap-1.5 py-1 marker:content-none [&::-webkit-details-marker]:hidden",
                )}
              >
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-open/reminders:rotate-90"
                />
                <span>Today&apos;s Reminders</span>
              </summary>
              <div className="mt-1">
                <HomeRemindersList />
              </div>
            </details>
          </div>

          <HomeRightAside>
            <HomeAsideContent />
          </HomeRightAside>
        </div>
      </div>
    </HomeAsideShell>
  );
}
