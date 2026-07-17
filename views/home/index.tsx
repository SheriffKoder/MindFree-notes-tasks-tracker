/**
 * @file views/home/index.tsx
 * Home dashboard composition for the protected MindFree landing route.
 */

import { ChevronRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthNotice } from "@/features/auth/model/auth-notice";
import { AuthNoticeBanner } from "@/features/auth/ui/auth-notice-banner";
import { cn } from "@/lib/utils";
import { HomeAsideShell } from "@/views/home/model/home-aside-drawer-context";
import { HomeAsideContent } from "@/views/home/ui/home-aside-content";
import { HomeHeaderToolbar } from "@/views/home/ui/home-header-toolbar";
import { HomeNotesSection } from "@/views/home/ui/home-notes-section";
import { HomeRightAside } from "@/views/home/ui/home-right-aside";
import { HomeTodayList } from "@/views/home/ui/home-today-list";

export { HomeHydrationSeed } from "@/views/home/ui/home-hydration-seed";

/** Shared section-header text style: h2 size, medium weight, muted. */
const SECTION_HEADER_CLASS =
  "text-[length:var(--text-xs)] font-medium leading-tight [color:var(--color-fg-muted)]";

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
        <section className="flex shrink-0 items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-h2">MindFree</h2>
            <p className="page-header__subtitle">
              This route is now the real app home, ready for starred notes, today&apos;s
              tasks, and reminders.
            </p>
          </div>

          <HomeHeaderToolbar />
        </section>

        {notice ? <AuthNoticeBanner notice={notice} /> : null}

        <div className="flex min-h-0 flex-1 flex-row gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <section>
              <div className="mb-2 flex flex-col">
                <h2 className={SECTION_HEADER_CLASS}>Starred Notes</h2>
              </div>
              <HomeNotesSection />
            </section>

            <details open className="group/today">
              <summary
                className={cn(
                  SECTION_HEADER_CLASS,
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

            <Card className="app-card">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className={SECTION_HEADER_CLASS}>Reminders</CardTitle>
                <CardDescription className="text-body-muted">
                  Vertical reminder stacks will live below today&apos;s tasks on the home
                  page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-muted">
                  The shell is now only responsible for structure, so this view can evolve
                  into the true dashboard without shared layout logic mixed in.
                </p>
              </CardContent>
            </Card>
          </div>

          <HomeRightAside>
            <HomeAsideContent />
          </HomeRightAside>
        </div>
      </div>
    </HomeAsideShell>
  );
}
