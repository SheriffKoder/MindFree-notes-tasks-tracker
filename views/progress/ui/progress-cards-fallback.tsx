/**
 * @file views/progress/ui/progress-cards-fallback.tsx
 * Suspense fallback for the Progress card grid.
 *
 * Purpose: Mirror `ListView` responsive columns (1 on mobile, 3 at `md+`) with
 *          card skeletons so streaming does not collapse the page body.
 * Used in: `views/progress/ui/progress-view.tsx`, `app/(app)/progress/loading.tsx`.
 * Used for: In-page and route-level Progress loading UI.
 */

import { ProgressCardSkeleton } from "@/views/progress/ui/progress-card-skeleton";

const SKELETON_COUNT = 3;

/**
 * Renders a responsive grid of Progress card skeletons.
 */
export function ProgressCardsFallback() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading progress">
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <ProgressCardSkeleton key={`mobile-${index}`} />
        ))}
      </div>
      <div className="hidden grid-cols-3 gap-4 md:grid">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <ProgressCardSkeleton key={`desktop-${index}`} />
        ))}
      </div>
    </div>
  );
}
