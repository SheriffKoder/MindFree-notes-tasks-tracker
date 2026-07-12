/**
 * @file entities/note/tanstack/use-update-note-mutation.ts
 * TanStack mutation for drawer PATCH autosave with optimistic cache updates.
 *
 * Purpose: Wire fetchPatchNote to TanStack with optimistic UI and rollback.
 * Used in: features/notes/note-drawer/pre-save-orchestrator/use-pre-save-orchestrator.ts
 * Used for: Autosave patch, general↔calendar moves, and same-day replace flows.
 *
 * Steps (onMutate → onSuccess):
 * 1. Resolve whether `date` differs from the loaded note (date patch).
 * 2. Snapshot affected cache buckets before writing.
 * 3. On date patch: relocateNoteInCache; else patch owning calendar/general bucket.
 * 4. On error: restore snapshots; on success: reconcile with server note.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import { fetchPatchNote } from "@/entities/note/mutations/patch-note";
import { relocateNoteInCache } from "@/entities/note/mutations/note-cache-mutations";
import {
  mergeFormValuesIntoNote,
  patchCalendarNotesCache,
  patchGeneralNotesCache,
  resolveOwningQueryKey,
} from "@/entities/note/mutations/patch-note-in-cache";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  Note,
} from "@/entities/note/model/types";
import { generalNotesQueryKey } from "@/entities/note/tanstack/query-keys";
import {
  clearNoteMutationPending,
  markNoteMutationPending,
} from "@/entities/note/tanstack/note-mutation-pending";

export interface UpdateNoteMutationInput {
  /** Existing note row being edited. */
  note: Note;
  /** Full editable form snapshot sent to the API. */
  values: NoteFormValues;
  /** Target calendar day — sent only when it differs from `note.date`. */
  date?: string | null;
  /** When true, server deletes the other note on the target day first. */
  replaceExistingOnDate?: boolean;
}

interface CacheSnapshot {
  queryKey: readonly unknown[];
  data: CalendarNotesResponse | GeneralNotesResponse | undefined;
}

interface UpdateNoteMutationContext {
  previousSnapshots: CacheSnapshot[];
}

function resolveDatePatch(
  note: Note,
  date: string | null | undefined,
): string | null | undefined {
  if (date === undefined) {
    return undefined;
  }

  if (note.date === date) {
    return undefined;
  }

  return date;
}

function snapshotOwningCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  note: Note,
  datePatch: string | null | undefined,
): CacheSnapshot[] {
  if (datePatch !== undefined) {
    const snapshots: CacheSnapshot[] = [];
    const calendarQueries = queryClient.getQueriesData<CalendarNotesResponse>({
      queryKey: ["calendarNotes"],
    });

    for (const [queryKey, data] of calendarQueries) {
      snapshots.push({ queryKey, data });
    }

    snapshots.push({
      queryKey: generalNotesQueryKey,
      data: queryClient.getQueryData<GeneralNotesResponse>(generalNotesQueryKey),
    });

    return snapshots;
  }

  const queryKey = resolveOwningQueryKey(note);

  return [
    {
      queryKey,
      data: queryClient.getQueryData<
        CalendarNotesResponse | GeneralNotesResponse
      >(queryKey),
    },
  ];
}

/**
 * PATCH autosave mutation — optimistically updates the owning read cache only.
 */
export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      note,
      values,
      date,
      replaceExistingOnDate,
    }: UpdateNoteMutationInput) => {
      const response = await fetchPatchNote(
        note.id,
        values,
        resolveDatePatch(note, date),
        replaceExistingOnDate,
      );
      return response.note;
    },
    onMutate: async ({ note, values, date }) => {
      markNoteMutationPending(note.id);

      const datePatch = resolveDatePatch(note, date);
      const previousSnapshots = snapshotOwningCaches(
        queryClient,
        note,
        datePatch,
      );
      const optimisticNote = mergeFormValuesIntoNote(
        note,
        values,
        datePatch ?? note.date,
      );

      if (datePatch !== undefined) {
        relocateNoteInCache(queryClient, note, optimisticNote);
      } else if (note.date) {
        const queryKey = resolveOwningQueryKey(note);

        await queryClient.cancelQueries({ queryKey });
        queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
          current
            ? patchCalendarNotesCache(current, optimisticNote)
            : current,
        );
      } else {
        const queryKey = resolveOwningQueryKey(note);

        await queryClient.cancelQueries({ queryKey });
        queryClient.setQueryData<GeneralNotesResponse>(queryKey, (current) =>
          current
            ? patchGeneralNotesCache(current, optimisticNote)
            : current,
        );
      }

      return { previousSnapshots } satisfies UpdateNoteMutationContext;
    },
    onSettled: (_data, _error, variables) => {
      clearNoteMutationPending(variables.note.id);
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      for (const snapshot of context.previousSnapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },
    onSuccess: (serverNote, { note, date }) => {
      const datePatch = resolveDatePatch(note, date);

      if (datePatch !== undefined || note.date !== serverNote.date) {
        relocateNoteInCache(queryClient, note, serverNote);
        return;
      }

      const queryKey = resolveOwningQueryKey(note);

      if (note.date) {
        queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
          current ? patchCalendarNotesCache(current, serverNote) : current,
        );
      } else {
        queryClient.setQueryData<GeneralNotesResponse>(queryKey, (current) =>
          current ? patchGeneralNotesCache(current, serverNote) : current,
        );
      }
    },
  });
}
