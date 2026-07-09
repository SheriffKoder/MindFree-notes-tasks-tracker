/**
 * @file app/(app)/notes/page.tsx
 * Protected notes route — server fetch and client boundary composition.
 */

import { Suspense } from "react";

import type { SearchParamsRecord } from "@/features/auth/model/auth-notice";
import { getNotesPageInitialData } from "@/entities/note";
import { NotesView } from "@/views/notes";

/**
 * Props for the protected notes route.
 */
interface NotesRouteProps {
  /** Current request search params (`month`, `view` in later steps). */
  searchParams: Promise<SearchParamsRecord>;
}

/**
 * Reads the first string value from a search param entry.
 *
 * @param value - raw App Router search param value
 * @returns first string value or `undefined`
 */
function getSearchParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}

/**
 * Resolves notes page data from the current request search params.
 *
 * @param props - protected route search params
 * @returns Notes view with SSR calendar and general payloads
 */
async function NotesRouteContent({ searchParams }: NotesRouteProps) {
  const resolvedSearchParams = await searchParams;
  const monthParam = getSearchParamValue(resolvedSearchParams.month);
  const { month, calendarNotes, generalNotes } =
    await getNotesPageInitialData(monthParam);

  return (
    <NotesView
      month={month}
      initialCalendarNotes={calendarNotes}
      initialGeneralNotes={generalNotes}
    />
  );
}

/**
 * Renders the protected notes route inside a Suspense boundary.
 *
 * @param props - protected route search params
 * @returns Notes route composition for `/notes`
 */
export default function NotesRoute({ searchParams }: NotesRouteProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <p className="text-body-muted">Loading notes…</p>
        </div>
      }
    >
      <NotesRouteContent searchParams={searchParams} />
    </Suspense>
  );
}
