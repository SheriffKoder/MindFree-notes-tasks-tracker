/**
 * @file features/profile/apply-theme/ui/profile-preferences-hydration-seed.tsx
 * SSR seed for ProfilePageData so theme prefs are ready on every protected route.
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
 * Seeds the profile page cache for theme application without blocking the shell.
 */
export async function ProfilePreferencesHydrationSeed() {
  await connection();

  const user = await getAuthenticatedUser();
  const data = await getProfilePageData(user.id, user.email);
  const queryClient = getQueryClient();
  seedProfilePageCache(queryClient, data);

  return <QueryHydration state={dehydrate(queryClient)}>{null}</QueryHydration>;
}
