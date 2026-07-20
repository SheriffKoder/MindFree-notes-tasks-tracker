/**
 * @file app/(app)/progress/page.tsx
 * Protected progress route that composes the Progress report inside the shell.
 *
 * Purpose: Resolve `?month=` on the server and render `ProgressView`. Loading
 *          skeletons and richer streaming land in Step 8.
 * Used in: Next.js App Router for `/progress`.
 * Used for: Monthly Progress SSR entry.
 */

import { parseMonthParam } from "@/entities/activity";
import type { SearchParamsRecord } from "@/features/auth/model/auth-notice";
import { ProgressView } from "@/views/progress";

interface ProgressRouteProps {
  /** Current request search params (`?month=`). */
  searchParams: Promise<SearchParamsRecord>;
}

/**
 * Renders the protected Progress route for one resolved month.
 *
 * @param props - async search params from the request
 */
export default async function ProgressRoute({
  searchParams,
}: ProgressRouteProps) {
  const resolved = await searchParams;
  const monthParam = resolved.month;
  const month = parseMonthParam(
    Array.isArray(monthParam) ? monthParam[0] : monthParam,
  );

  return <ProgressView month={month} />;
}
