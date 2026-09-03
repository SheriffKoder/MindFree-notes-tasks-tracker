/**
 * @file views/home/lib/select-diary-strip.ts
 * Resolves the default Diary strip from a home notes payload.
 */

import type { HomeNotesResponse, HomeNotesStrip } from "@/entities/note/model/read-models";

/**
 * Returns the Diary strip, or the first strip when Diary is missing from cache.
 */
export function selectDiaryStrip(
  data: HomeNotesResponse | undefined,
): HomeNotesStrip | null {
  if (!data?.strips.length) {
    return null;
  }

  return data.strips.find((strip) => strip.isDefault) ?? data.strips[0] ?? null;
}
