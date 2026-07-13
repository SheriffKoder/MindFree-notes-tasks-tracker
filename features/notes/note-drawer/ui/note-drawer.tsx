/**
 * @file features/notes/note-drawer/ui/note-drawer.tsx
 * Notes drawer island — shell, editor, date navigation, and cache resolution.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import { NoteForm } from "@/entities/note/editor";
import type { NoteFormFooterMeta } from "@/entities/note/editor/model/types";
import { useDeleteNoteMutation } from "@/entities/note/client";
import { AppDrawer } from "@/shared/drawer";
import { useAuthUserId } from "@/shared/offline-queue";
import { useDrawerActiveDate } from "@/features/notes/note-drawer/model/use-drawer-active-date";
import { useDrawerDateNavigation } from "@/features/notes/note-drawer/model/use-drawer-date-navigation";
import { useDrawerMonthPrefetch } from "@/features/notes/note-drawer/model/use-drawer-month-prefetch";
import { useNoteDrawerRealtimeSync } from "@/features/notes/note-drawer/model/use-note-drawer-realtime-sync";
import { useResolvedDrawerNote } from "@/features/notes/note-drawer/model/use-resolved-drawer-note";
import {
  resolveOpeningCalendarDate,
  usePreSaveOrchestrator,
} from "@/features/notes/note-drawer/pre-save-orchestrator";
import { NoteDrawerFooter } from "@/features/notes/note-drawer/ui/note-drawer-footer";
import type { UseNotesDrawerResult } from "@/views/notes/model/editor/use-notes-drawer";

export interface NoteDrawerProps {
  /** Page-level drawer open/close state and editor request. */
  drawer: UseNotesDrawerResult;
  /** Clears page selection when the drawer is dismissed. */
  onDismiss?: () => void;
}

const INITIAL_FOOTER_META: NoteFormFooterMeta = {
  formattedLastEditedAt: null,
  saveStatus: "idle",
};

/**
 * Composes the note editor inside `AppDrawer` with optional calendar day navigation.
 *
 * Date navigation is independent from page URL month and page calendar highlight.
 */
export function NoteDrawer({ drawer, onDismiss }: NoteDrawerProps) {
  const { isOpen, request, setOpen, openEdit } = drawer;
  const userId = useAuthUserId();
  const deleteNoteMutation = useDeleteNoteMutation();
  const [footerMeta, setFooterMeta] =
    useState<NoteFormFooterMeta>(INITIAL_FOOTER_META);

  const { activeDate, isDateNavEnabled, setActiveDate } = useDrawerActiveDate(
    request,
    isOpen,
  );
  const note = useResolvedDrawerNote(request, activeDate, isDateNavEnabled);

  const handleGeneralNoteCreated = useCallback(
    (noteId: string) => {
      openEdit(noteId);
    },
    [openEdit],
  );

  const handleQuickNoteCreated = useCallback(
    (noteId: string) => {
      openEdit(noteId);
    },
    [openEdit],
  );

  const {
    saveStatus,
    handleChange,
    commitKey,
    effectiveDateNavEnabled,
    applyPickedDate,
    conflict,
    resolveReplace,
    resolveDismiss,
    reevaluateFromCache,
  } = usePreSaveOrchestrator({
    note,
    isOpen,
    request,
    activeDate,
    isDateNavEnabled,
    userId,
    onGeneralNoteCreated: handleGeneralNoteCreated,
    onQuickNoteCreated: handleQuickNoteCreated,
  });

  const { goToPreviousDay, goToNextDay, swipeHandlers } =
    useDrawerDateNavigation({
      activeDate,
      isDateNavEnabled: effectiveDateNavEnabled,
      setActiveDate,
    });

  useDrawerMonthPrefetch(activeDate, effectiveDateNavEnabled);

  const resetKey = useMemo(() => {
    if (note?.id) {
      return note.id;
    }

    if (activeDate) {
      return `date:${activeDate}`;
    }

    if (request?.mode === "create" && "general" in request) {
      return "general-draft";
    }

    if (request?.mode === "create" && "quick" in request) {
      return "quick-draft";
    }

    if (request?.mode === "create" && "date" in request) {
      return `date:${request.date}`;
    }

    if (request?.mode === "edit") {
      return `edit:${request.noteId}`;
    }

    return "draft";
  }, [activeDate, note?.id, request]);

  /** Pre-fill title on open only — not tied to pipeline nav gating. */
  const prefillCalendarDate = useMemo(() => {
    if (note?.date) {
      return note.date;
    }

    return resolveOpeningCalendarDate(activeDate, request);
  }, [activeDate, note?.date, request]);

  const handleFooterMetaChange = useCallback((meta: NoteFormFooterMeta) => {
    setFooterMeta(meta);
  }, []);

  const noteId = note?.id ?? null;
  const { remoteSyncKey, handleChangeWithDirty } =
    useNoteDrawerRealtimeSync({
      isOpen,
      noteId,
      resetKey,
      onChange: handleChange,
      reevaluateFromCache,
    });

  const handleDatePick = useCallback(
    (isoDate: string) => applyPickedDate(isoDate),
    [applyPickedDate],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onDismiss?.();
      }

      setOpen(open);
    },
    [onDismiss, setOpen],
  );

  const handleDelete = useCallback(() => {
    if (!note?.id) {
      return;
    }

    deleteNoteMutation.mutate(
      { note },
      {
        onSuccess: () => {
          onDismiss?.();
          setOpen(false);
        },
      },
    );
  }, [deleteNoteMutation, note, onDismiss, setOpen]);

  return (
    <AppDrawer
      ariaLabel="Note editor"
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <div
        className="flex min-h-full flex-col"
        {...(swipeHandlers ?? {})}
      >
        <NoteForm
          calendarDate={prefillCalendarDate}
          commitKey={commitKey}
          note={note}
          remoteSyncKey={remoteSyncKey}
          resetKey={resetKey}
          saveStatus={saveStatus}
          showContentLastSaved={false}
          onChange={handleChangeWithDirty}
          onDatePick={handleDatePick}
          onDelete={note?.id ? handleDelete : undefined}
          onFooterMetaChange={handleFooterMetaChange}
        />

        <NoteDrawerFooter
          activeDate={activeDate}
          conflict={conflict}
          formattedLastEditedAt={footerMeta.formattedLastEditedAt}
          isDateNavEnabled={effectiveDateNavEnabled}
          saveStatus={footerMeta.saveStatus}
          onNext={goToNextDay}
          onPrevious={goToPreviousDay}
          onResolveDismiss={resolveDismiss}
          onResolveReplace={resolveReplace}
        />
      </div>
    </AppDrawer>
  );
}
