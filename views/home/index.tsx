/**
 * @file views/home/index.tsx
 * Home dashboard composition for the protected MindFree landing route.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthNotice } from "@/features/auth/model/auth-notice";
import { AuthNoticeBanner } from "@/features/auth/ui/auth-notice-banner";
import { HomeAsideShell } from "@/views/home/model/home-aside-drawer-context";
import { HomeAsideContent } from "@/views/home/ui/home-aside-content";
import { HomeHeaderToolbar } from "@/views/home/ui/home-header-toolbar";
import { HomeNotesSection } from "@/views/home/ui/home-notes-section";
import { HomeRightAside } from "@/views/home/ui/home-right-aside";

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
                <h2 className="text-h3">Starred Notes</h2>
                <p className="page-header__subtitle">
                  Horizontal note cards and a quick-note default entry belong here.
                </p>
              </div>
              <HomeNotesSection />
            </section>

            <Card className="app-card">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-h3">Today&apos;s Tasks</CardTitle>
                <CardDescription className="text-body-muted">
                  Scheduled tasks, completion state, and quick time-entry flows go here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-muted">
                  This section is the next candidate for real task widgets once the data
                  model lands.
                </p>
              </CardContent>
            </Card>

            <Card className="app-card">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-h3">Reminders</CardTitle>
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
