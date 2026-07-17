/**
 * @file app/(app)/page.tsx
 * Protected home route that composes the real app dashboard inside the shared shell.
 */

import { Suspense } from "react";

import {
  getProtectedAppNotice,
  type SearchParamsRecord,
} from "@/features/auth/model/auth-notice";
import { HomeHydrationSeed, HomeView } from "@/views/home";

/**
 * Props for the protected home route.
 */
interface ProtectedHomeRouteProps {
  /** Current request search params used for protected auth notices. */
  searchParams: Promise<SearchParamsRecord>;
}

/**
 * Resolves protected home-page state from the current request search params.
 *
 * @param props - protected route search params
 * @returns Home view with any protected auth notice applied
 */
async function ProtectedHomeRouteContent({
  searchParams,
}: ProtectedHomeRouteProps) {
  const resolvedSearchParams = await searchParams;
  const notice = getProtectedAppNotice(resolvedSearchParams);

  return <HomeView notice={notice} />;
}

/**
 * Renders the protected home route inside a Suspense boundary.
 *
 * @param props - protected route search params
 * @returns Home dashboard route for `/`
 */
export default function ProtectedHomeRoute({
  searchParams,
}: ProtectedHomeRouteProps) {
  return (
    <>
      <Suspense fallback={null}>
        <HomeHydrationSeed />
      </Suspense>
      <Suspense fallback={<HomeView />}>
        <ProtectedHomeRouteContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
