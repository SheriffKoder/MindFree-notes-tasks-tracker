import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";

import { noteChangeFromOfflineFlush } from "@/entities/note/offline/note-change-from-offline";
import type { NoteOfflinePayload } from "@/entities/note/offline/notes-offline-storage";
import type { Note } from "@/entities/note/model/types";
import {
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

function buildPayload(
  overrides: Partial<NoteOfflinePayload> = {},
): NoteOfflinePayload {
  return {
    operation: "patch",
    noteId: "note-1",
    date: null,
    values: {
      title: "Title",
      content: "Content",
      starred: false,
      isImportant: false,
    },
    replaceExistingOnDate: false,
    savedAt: "2024-06-02T12:00:00.000Z",
    ...overrides,
  };
}

describe("noteChangeFromOfflineFlush", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("maps a successful patch flush to update", () => {
    const previous = buildNote();
    const serverNote = buildNote({
      content: "Updated offline",
      lastEditedAt: "2024-06-03T12:00:00.000Z",
    });

    queryClient.setQueryData(generalNotesQueryKey, {
      generalNotes: [previous],
    });

    const change = noteChangeFromOfflineFlush(
      queryClient,
      buildPayload({ operation: "patch" }),
      { previous, serverNote },
    );

    expect(change).toEqual({
      type: "update",
      previous,
      next: serverNote,
    });
  });

  it("maps a successful quick-note create flush to update", () => {
    const previous = buildNote({
      id: "optimistic-quick",
      isQuick: true,
      title: "",
    });
    const serverNote = buildNote({
      id: "quick-real",
      isQuick: true,
      title: "",
      lastEditedAt: "2024-06-03T12:00:00.000Z",
    });

    queryClient.setQueryData(homeNotesQueryKey, {
      quickNote: previous,
      starredNotes: [],
    });

    const change = noteChangeFromOfflineFlush(
      queryClient,
      buildPayload({
        operation: "create-quick",
        noteId: null,
        isQuick: true,
      }),
      { previous, serverNote },
    );

    expect(change).toEqual({
      type: "update",
      previous,
      next: serverNote,
    });
  });

  it("maps a successful delete flush to delete", () => {
    const previous = buildNote({ starred: true });

    const change = noteChangeFromOfflineFlush(
      queryClient,
      buildPayload({ operation: "delete" }),
      { previous, serverNote: null },
    );

    expect(change).toEqual({ type: "delete", note: previous });
  });

  it("maps a create flush without previous to create", () => {
    const serverNote = buildNote({ starred: true });

    const change = noteChangeFromOfflineFlush(
      queryClient,
      buildPayload({
        operation: "create-general",
        noteId: null,
      }),
      { previous: null, serverNote },
    );

    expect(change).toEqual({ type: "create", note: serverNote });
  });
});
