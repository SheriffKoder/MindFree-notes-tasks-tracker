/**
 * @file views/progress/ui/progress-page-shell.tsx
 * Shared Progress page chrome for the live view and route loading UI.
 *
 * Purpose: One composition for heading, controls slot, and scrollable body so
 *          `loading.tsx` does not shift layout relative to `ProgressView`.
 * Used in: `views/progress/ui/progress-view.tsx`, `app/(app)/progress/loading.tsx`.
 * Used for: Stable Progress page frame.
 */

import type { ReactNode } from "react";

import { OfflineBanner } from "@/shared/offline-queue";

export interface ProgressPageShellProps {
  /** Month navigator island or its loading placeholder. */
  monthControls: ReactNode;
  /** Card grid, empty state, or skeleton fallback. */
  children: ReactNode;
}

/**
 * Renders the Progress page frame around month controls and body content.
 */
export function ProgressPageShell({
  monthControls,
  children,
}: ProgressPageShellProps) {
  return (
    <>
      <OfflineBanner />
      <div className="mx-auto flex h-full w-full flex-col gap-4">
        <section className="flex shrink-0 flex-col gap-2">
          <h2 className="text-h2">Progress</h2>
          <p className="page-header__subtitle">
            Monthly task progress, weekly breakdowns, and all-time totals.
          </p>
        </section>

        <section
          aria-label="Progress month controls"
          className="flex shrink-0 flex-row items-center gap-3"
        >
          {monthControls}
        </section>

        <div className="relative min-h-0 flex-1">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[-10] z-10 h-8 w-full bg-gradient-to-b from-[var(--color-bg)] to-transparent"
          />
          <div className="flex h-full min-h-0 flex-col overflow-x-auto overflow-y-auto pt-4 md:pt-5">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
