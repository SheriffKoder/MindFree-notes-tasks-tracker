/**
 * @file shared/react-query/ui/query-hydration.tsx
 * Merges SSR-dehydrated query cache into the app QueryClient.
 */

"use client";

import type { DehydratedState } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";

export interface QueryHydrationProps {
  /** Dehydrated TanStack Query cache from a server page or layout. */
  state: DehydratedState;
  children: React.ReactNode;
}

/**
 * Hydrates prefetched queries into the layout-level QueryClient.
 */
export function QueryHydration({ state, children }: QueryHydrationProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
