import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";

import { synchronizeNoteCaches } from "@/entities/note/cache/synchronize-note-caches";
import type { Note } from "@/entities/note/model/types";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
  homeNotesQueryKey,
} from "@/entities/note/client/query-keys";

function buildNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    date: null,
    title: "Title",
    content: "Content",
    starred: false,
    isImportant: false,
    isQuick: false,
    lastEditedAt: "2024-06-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("synchronizeNoteCaches", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("adds a starred note to the home cache on update", () => {
    const previous = buildNote();
    const next = buildNote({ starred: true, lastEditedAt: "2024-06-02T12:00:00.000Z" });

    queryClient.setQueryData(homeNotesQueryKey, {
      quickNote: null,
      starredNotes: [],
    });
    queryClient.setQueryData(generalNotesQueryKey, {
      generalNotes: [previous],
    });

    synchronizeNoteCaches(queryClient, { type: "update", previous, next });

    const home = queryClient.getQueryData<{
      quickNote: Note | null;
      starredNotes: Note[];
    }>(homeNotesQueryKey);

    expect(home?.starredNotes).toHaveLength(1);
    expect(home?.starredNotes[0]?.id).toBe("note-1");
    expect(home?.starredNotes[0]?.starred).toBe(true);

    const general = queryClient.getQueryData<{ generalNotes: Note[] }>(
      generalNotesQueryKey,
    );
    expect(general?.generalNotes[0]?.starred).toBe(true);
  });

  it("sets the quick slot and removes owner caches on promote-to-quick", () => {
    const previous = buildNote({ starred: true });
    const next = buildNote({
      isQuick: true,
      starred: false,
      title: "",
      lastEditedAt: "2024-06-02T12:00:00.000Z",
    });

    queryClient.setQueryData(homeNotesQueryKey, {
      quickNote: null,
      starredNotes: [previous],
    });
    queryClient.setQueryData(generalNotesQueryKey, {
      generalNotes: [previous],
    });

    synchronizeNoteCaches(queryClient, { type: "update", previous, next });

    const home = queryClient.getQueryData<{
      quickNote: Note | null;
      starredNotes: Note[];
    }>(homeNotesQueryKey);

    expect(home?.quickNote?.isQuick).toBe(true);
    expect(home?.starredNotes).toHaveLength(0);

    const general = queryClient.getQueryData<{ generalNotes: Note[] }>(
      generalNotesQueryKey,
    );
    expect(general?.generalNotes).toHaveLength(0);
  });

  it("creates a quick note in the home cache only", () => {
    const quickNote = buildNote({
      id: "quick-1",
      isQuick: true,
      title: "",
      lastEditedAt: "2024-06-01T12:00:00.000Z",
    });

    queryClient.setQueryData(homeNotesQueryKey, {
      quickNote: null,
      starredNotes: [],
    });
    queryClient.setQueryData(generalNotesQueryKey, {
      generalNotes: [],
    });

    synchronizeNoteCaches(queryClient, { type: "create", note: quickNote });

    const home = queryClient.getQueryData<{
      quickNote: Note | null;
      starredNotes: Note[];
    }>(homeNotesQueryKey);

    expect(home?.quickNote?.id).toBe("quick-1");

    const general = queryClient.getQueryData<{ generalNotes: Note[] }>(
      generalNotesQueryKey,
    );
    expect(general?.generalNotes).toHaveLength(0);
  });

  it("removes a note from home and owner caches on delete", () => {
    const note = buildNote({ starred: true });

    queryClient.setQueryData(homeNotesQueryKey, {
      quickNote: null,
      starredNotes: [note],
    });
    queryClient.setQueryData(generalNotesQueryKey, {
      generalNotes: [note],
    });

    synchronizeNoteCaches(queryClient, { type: "delete", note });

    const home = queryClient.getQueryData<{
      quickNote: Note | null;
      starredNotes: Note[];
    }>(homeNotesQueryKey);
    expect(home?.starredNotes).toHaveLength(0);

    const general = queryClient.getQueryData<{ generalNotes: Note[] }>(
      generalNotesQueryKey,
    );
    expect(general?.generalNotes).toHaveLength(0);
  });

  it("relocates a note between calendar months on date change", () => {
    const previous = buildNote({
      date: "2024-06-10",
      lastEditedAt: "2024-06-01T12:00:00.000Z",
    });
    const next = buildNote({
      date: "2024-07-10",
      lastEditedAt: "2024-06-02T12:00:00.000Z",
    });

    queryClient.setQueryData(calendarNotesQueryKey("2024-06"), {
      month: "2024-06",
      monthNotes: [previous],
      calendarDays: [],
    });
    queryClient.setQueryData(calendarNotesQueryKey("2024-07"), {
      month: "2024-07",
      monthNotes: [],
      calendarDays: [],
    });
    queryClient.setQueryData(homeNotesQueryKey, {
      quickNote: null,
      starredNotes: [],
    });

    synchronizeNoteCaches(queryClient, { type: "update", previous, next });

    const june = queryClient.getQueryData<{ monthNotes: Note[] }>(
      calendarNotesQueryKey("2024-06"),
    );
    const july = queryClient.getQueryData<{ monthNotes: Note[] }>(
      calendarNotesQueryKey("2024-07"),
    );

    expect(june?.monthNotes).toHaveLength(0);
    expect(july?.monthNotes).toHaveLength(1);
    expect(july?.monthNotes[0]?.date).toBe("2024-07-10");
  });
});
