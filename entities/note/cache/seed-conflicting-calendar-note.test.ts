/**
 * @file entities/note/cache/seed-conflicting-calendar-note.test.ts
 * Unit tests for same-day conflict cache seeding after a 409.
 */

import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { seedConflictingCalendarNoteInCache } from "@/entities/note/cache/seed-conflicting-calendar-note";
import { calendarNotesQueryKey } from "@/entities/note/client/query-keys";
import type { CalendarNotesResponse } from "@/entities/note/model/read-models";
import type { Note } from "@/entities/note/model/types";

function buildNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    title: "Existing",
    content: "Body",
    starred: false,
    isImportant: false,
    isQuick: false,
    date: "2024-06-15",
    lastEditedAt: "2024-06-15T12:00:00.000Z",
    revision: 2,
    ...overrides,
  };
}

function buildMonthCache(notes: Note[]): CalendarNotesResponse {
  return {
    month: "2024-06",
    monthNotes: notes,
    calendarDays: [],
  };
}

describe("seedConflictingCalendarNoteInCache", () => {
  it("upserts the occupant when the month cache is present", () => {
    const queryClient = new QueryClient();
    const queryKey = calendarNotesQueryKey("2024-06");
    const occupant = buildNote();

    queryClient.setQueryData(queryKey, buildMonthCache([]));

    seedConflictingCalendarNoteInCache(queryClient, "2024-06-15", occupant);

    const cached = queryClient.getQueryData<CalendarNotesResponse>(queryKey);
    expect(cached?.monthNotes).toEqual([occupant]);
  });

  it("invalidates the month when the occupant body is missing", () => {
    const queryClient = new QueryClient();
    const queryKey = calendarNotesQueryKey("2024-06");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    seedConflictingCalendarNoteInCache(queryClient, "2024-06-15", null);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
  });

  it("invalidates the month when cache is empty even if note is provided", () => {
    const queryClient = new QueryClient();
    const queryKey = calendarNotesQueryKey("2024-06");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    seedConflictingCalendarNoteInCache(
      queryClient,
      "2024-06-15",
      buildNote(),
    );

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
  });
});
