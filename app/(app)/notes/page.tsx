/**
 * @file app/(app)/notes/page.tsx
 * Protected notes route — SSR prefetch, hydration, then client URL/query islands.
 */

import { Suspense } from "react";

import { NotesHydrationBoundary } from "@/app/(app)/notes/notes-hydration-seed";
import type { SearchParamsRecord } from "@/features/auth/model/auth-notice";
import { NotesClient } from "@/views/notes/ui/notes-client";

/**
 * Resolves the raw month search param from the current request.
 */
function getMonthParam(searchParams: SearchParamsRecord) {
  const month = searchParams.month;

  return typeof month === "string" ? month : null;
}

/**
 * Server boundary that hydrates the Notes cache before the client shell mounts.
 */
async function NotesPageContent({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <NotesHydrationBoundary monthParam={getMonthParam(resolvedSearchParams)}>
      <NotesClient />
    </NotesHydrationBoundary>
  );
}

/**
 * Renders the Notes route. Initial data is prefetched on the server; `?month=` and
 * `?view=` toggles update client state only after hydration (no route Suspense flash).
 */
export default function NotesRoute({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  return (
    <Suspense fallback={null}>
      <NotesPageContent searchParams={searchParams} />
    </Suspense>
  );
}
