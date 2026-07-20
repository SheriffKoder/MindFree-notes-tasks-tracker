/**
 * @file views/profile/ui/profile-hydration-seed.tsx
 * SSR seed for the Profile TanStack cache — non-blocking sibling of ProfileClient.
 */

import { dehydrate } from "@tanstack/react-query";
import { connection } from "next/server";

import {
  getAuthenticatedUser,
  getProfilePageData,
  seedProfilePageCache,
} from "@/entities/profile/server";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Merges ProfilePageData into the app QueryClient without blocking the UI shell.
 */
export async function ProfileHydrationSeed() {
  await connection();

  const user = await getAuthenticatedUser();
  const data = await getProfilePageData(user.id, user.email);
  const queryClient = getQueryClient();
  seedProfilePageCache(queryClient, data);

  return <QueryHydration state={dehydrate(queryClient)}>{null}</QueryHydration>;
}
