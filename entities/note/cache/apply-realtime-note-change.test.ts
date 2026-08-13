/**
 * @file entities/note/cache/apply-realtime-note-change.test.ts
 * Drives revision newer-wins, pending skip, and INSERT/UPDATE/DELETE without Supabase.
 */

import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  applyRealtimeNoteChange,
  isRemoteNoteNewer,
} from "@/entities/note/cache/apply-realtime-note-change";
import { generalNotesQueryKey } from "@/entities/note/client/query-keys";
import {
  clearNoteMutationPending,
  markNoteMutationPending,
} from "@/entities/note/hooks/note-mutation-pending";
import type { Note, NoteRow } from "@/entities/note/model/types";

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
    revision: 1,
    ...overrides,
  };
}

function buildRow(
  overrides: Partial<NoteRow> & Pick<NoteRow, "id">,
): Record<string, unknown> {
  return {
    user_id: "user-1",
    date: null,
    title: "Title",
    content: "Content",
    starred: false,
    is_important: false,
    is_quick: false,
    last_edited_at: "2024-06-01T12:00:00.000Z",
    revision: 1,
    created_at: "2024-06-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("isRemoteNoteNewer", () => {
  it("returns true when cached note is missing", () => {
    expect(isRemoteNoteNewer(buildNote({ revision: 2 }), null)).toBe(true);
  });

  it("compares revision, not optimistic lastEditedAt bumps", () => {
    const remote = buildNote({
      revision: 2,
      lastEditedAt: "2024-06-01T12:00:00.000Z",
      title: "Remote",
    });
    const cached = buildNote({
      revision: 1,
      lastEditedAt: "2024-06-03T12:00:00.000Z",
      title: "Optimistic local",
    });

    expect(isRemoteNoteNewer(remote, cached)).toBe(true);
  });

  it("returns false when remote revision is equal or lower", () => {
    const cached = buildNote({ revision: 3 });

    expect(isRemoteNoteNewer(buildNote({ revision: 3 }), cached)).toBe(false);
    expect(isRemoteNoteNewer(buildNote({ revision: 2 }), cached)).toBe(false);
  });
});

describe("applyRealtimeNoteChange", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    clearNoteMutationPending("note-1");
  });

  it("UPDATE patches when remote revision is higher", () => {
    queryClient.setQueryData(generalNotesQueryKey, {
      generalNotes: [buildNote({ revision: 1, title: "Local" })],
    });

    const result = applyRealtimeNoteChange(
      queryClient,
      "UPDATE",
      buildRow({
        id: "note-1",
        title: "Remote",
        revision: 2,
        last_edited_at: "2024-06-02T12:00:00.000Z",
      }),
      null,
    );

    expect(result.applied).toBe(true);

    const cached = queryClient.getQueryData<{ generalNotes: Note[] }>(
      generalNotesQueryKey,
    );

    expect(cached?.generalNotes[0]?.title).toBe("Remote");
    expect(cached?.generalNotes[0]?.revision).toBe(2);
  });

  it("UPDATE skips when remote revision is stale or equal", () => {
    queryClient.setQueryData(generalNotesQueryKey, {
      generalNotes: [
        buildNote({
          revision: 3,
          title: "Local",
          lastEditedAt: "2024-06-01T12:00:00.000Z",
        }),
      ],
    });

    const result = applyRealtimeNoteChange(
      queryClient,
      "UPDATE",
      buildRow({
        id: "note-1",
        title: "Stale",
        revision: 2,
        last_edited_at: "2024-06-03T12:00:00.000Z",
      }),
      null,
    );

    expect(result.applied).toBe(false);

    const cached = queryClient.getQueryData<{ generalNotes: Note[] }>(
      generalNotesQueryKey,
    );

    expect(cached?.generalNotes[0]?.title).toBe("Local");
    expect(cached?.generalNotes[0]?.revision).toBe(3);
  });

  it("UPDATE skips while a local mutation is pending", () => {
    queryClient.setQueryData(generalNotesQueryKey, {
      generalNotes: [buildNote({ revision: 1 })],
    });
    markNoteMutationPending("note-1");

    const result = applyRealtimeNoteChange(
      queryClient,
      "UPDATE",
      buildRow({
        id: "note-1",
        title: "Remote",
        revision: 2,
        last_edited_at: "2024-06-02T12:00:00.000Z",
      }),
      null,
    );

    expect(result.applied).toBe(false);

    const cached = queryClient.getQueryData<{ generalNotes: Note[] }>(
      generalNotesQueryKey,
    );

    expect(cached?.generalNotes[0]?.title).toBe("Title");
  });

  it("DELETE removes a cached note when no mutation is pending", () => {
    queryClient.setQueryData(generalNotesQueryKey, {
      generalNotes: [buildNote()],
    });

    const result = applyRealtimeNoteChange(
      queryClient,
      "DELETE",
      null,
      buildRow({ id: "note-1" }),
    );

    expect(result.applied).toBe(true);

    const cached = queryClient.getQueryData<{ generalNotes: Note[] }>(
      generalNotesQueryKey,
    );

    expect(cached?.generalNotes).toHaveLength(0);
  });
});
