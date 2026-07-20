/**
 * @file views/progress/ui/progress-card-skeleton.tsx
 * Placeholder card matching Progress report card chrome.
 *
 * Purpose: Keep layout stable while ProgressCards streams — same border,
 *          header, summary, and week strip footprint as ActivityProgressCard.
 * Used in: `views/progress/ui/progress-cards-fallback.tsx`,
 *          `app/(app)/progress/loading.tsx`.
 * Used for: Loading UI that does not shift the page layout materially.
 */

/**
 * Renders one Progress card skeleton.
 */
export function ProgressCardSkeleton() {
  return (
    <article
      aria-hidden
      className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span className="mt-1.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[var(--color-border)]" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="h-4 w-40 max-w-full animate-pulse rounded bg-[var(--color-border)]" />
            <span className="h-3 w-24 max-w-full animate-pulse rounded bg-[var(--color-border)]" />
          </div>
        </div>
        <span className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-[var(--color-border)]" />
      </header>

      <div className="flex flex-col gap-2">
        <span className="h-4 w-52 max-w-full animate-pulse rounded bg-[var(--color-border)]" />
        <span className="h-4 w-44 max-w-full animate-pulse rounded bg-[var(--color-border)]" />
      </div>

      <div className="grid grid-cols-5 gap-2 border-t border-[var(--color-border)] pt-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            <span className="h-3 w-6 animate-pulse rounded bg-[var(--color-border)]" />
            <span className="h-4 w-8 animate-pulse rounded bg-[var(--color-border)]" />
            <span className="h-3 w-10 animate-pulse rounded bg-[var(--color-border)]" />
          </div>
        ))}
      </div>
    </article>
  );
}
