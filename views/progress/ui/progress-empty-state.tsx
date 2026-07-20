/**
 * @file views/progress/ui/progress-empty-state.tsx
 * Empty Progress report copy for a month with no task cards.
 *
 * Purpose: Distinguish “nothing to show this month” from load failures (which
 *          reach the route error boundary).
 * Used in: `views/progress/ui/progress-cards.tsx`.
 * Used for: Empty Progress grid body.
 */

/**
 * Renders the empty Progress state for the selected month.
 */
export function ProgressEmptyState() {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-10">
      <p className="text-center text-body-muted">
        No task progress for this month.
      </p>
    </div>
  );
}
