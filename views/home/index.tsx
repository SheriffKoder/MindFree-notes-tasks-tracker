/**
 * @file views/home/index.tsx
 * Home dashboard composition for the protected MindFree landing route.
 */

import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthNotice } from "@/features/auth/model/auth-notice";
import { LogoutButton } from "@/features/auth/logout";
import { AuthNoticeBanner } from "@/features/auth/ui/auth-notice-banner";

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <section className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-caption uppercase tracking-[0.2em] [color:var(--color-fg-muted)]">
            MindFree
          </p>
          <h2 className="text-h2">Home</h2>
          <p className="text-body-muted">
            This route is now the real app home, ready for starred notes, today&apos;s
            tasks, and reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LogoutButton />
        </div>
      </section>

      {notice ? <AuthNoticeBanner notice={notice} /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="app-card">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-h3">Starred Notes</CardTitle>
            <CardDescription className="text-body-muted">
              Horizontal note cards and a quick-note default entry belong here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-muted">
              Start by loading recent starred daily notes and the pinned quick note.
            </p>
          </CardContent>
        </Card>

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

        <Card className="app-card xl:col-span-2">
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
    </div>
  );
}
