/**
 * @file app/(app)/progress/loading.tsx
 * Route-level loading UI for `/progress`.
 *
 * Purpose: Show the Progress page frame with card skeletons while the route
 *          segment resolves (including async `searchParams`). Matches
 *          `ProgressView` layout so transitions do not shift the shell.
 * Used in: Next.js App Router automatic loading boundary for `/progress`.
 * Used for: Initial load and month navigations that remount the page segment.
 */

import { ProgressCardsFallback } from "@/views/progress/ui/progress-cards-fallback";
import { ProgressPageShell } from "@/views/progress/ui/progress-page-shell";

/**
 * Renders the Progress route loading shell.
 */
export default function ProgressLoading() {
  return (
    <ProgressPageShell
      monthControls={
        <div
          aria-hidden
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-3 py-2 shadow-sm"
        >
          <span className="h-9 w-9 animate-pulse rounded-md bg-[var(--color-border)]" />
          <span className="h-4 w-28 animate-pulse rounded bg-[var(--color-border)]" />
          <span className="h-9 w-9 animate-pulse rounded-md bg-[var(--color-border)]" />
        </div>
      }
    >
      <ProgressCardsFallback />
    </ProgressPageShell>
  );
}
