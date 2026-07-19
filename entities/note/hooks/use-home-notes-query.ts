/**
 * @file entities/note/hooks/use-home-notes-query.ts
 * Reads home notes from the TanStack cache (quick slot + starred carousel).
 */

import { useQuery } from "@tanstack/react-query";

import { homeNotesQueryOptions } from "@/entities/note/client/home-notes-query";

/**
 * Reads home notes from the TanStack cache (quick slot + starred carousel).
 */
export function useHomeNotesQuery() {
  return useQuery(homeNotesQueryOptions());
}
