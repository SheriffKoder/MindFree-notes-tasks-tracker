/**
 * @file features/notes/note-drawer/ui/note-drawer.tsx
 * Notes drawer island — shell, editor, date navigation, and cache resolution.
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { NoteForm } from "@/entities/note/editor";
import type { NoteFormFooterMeta } from "@/entities/note/editor/model/types";
import {
  calendarNotesQueryOptions,
  useDeleteNoteMutation,
} from "@/entities/note/client";
import { isOptimisticNoteId } from "@/entities/note";
import { AppDrawer, DrawerTitle } from "@/shared/drawer";
import { useAuthUserId } from "@/shared/offline-queue";
import { findNoteOnDateInCache } from "@/features/notes/note-drawer/lib/find-note-in-cache";
import { monthOfIsoDate } from "@/features/notes/note-drawer/lib/month-of-iso-date";
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
  const queryClient = useQueryClient();
  const deleteNoteMutation = useDeleteNoteMutation();
  const [footerMeta, setFooterMeta] =
    useState<NoteFormFooterMeta>(INITIAL_FOOTER_META);

  const { activeDate, isDateNavEnabled, setActiveDate } = useDrawerActiveDate(
    request,
    isOpen,
  );
  const note = useResolvedDrawerNote(request, activeDate, isDateNavEnabled);

  const createDate =
    request?.mode === "create" && "date" in request
      ? (activeDate ?? request.date)
      : null;
  const createMonth = createDate ? monthOfIsoDate(createDate) : null;
  const { data: createMonthData } = useQuery({
    ...calendarNotesQueryOptions(createMonth ?? ""),
    enabled: Boolean(isOpen && createMonth),
  });

  const isQuickNoteContext = useMemo(
    () =>
      Boolean(note?.isQuick) ||
      (request?.mode === "create" && "quick" in request),
    [note?.isQuick, request],
  );

  const canPromoteToQuick = Boolean(note?.id && !note.isQuick);

  const handleGeneralNoteCreated = useCallback(
    (noteId: string) => {
      openEdit(noteId);
    },
    [openEdit],
  );

  const handleCalendarNoteCreated = useCallback(
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
    saveFeedback,
    handleChange,
    commitKey,
    formReloadKey,
    bumpFormReloadKey,
    effectiveDateNavEnabled,
    applyPickedDate,
    conflict,
    resolveReplace,
    resolveDismiss,
    reevaluateFromCache,
    acceptRemoteFormSync,
    getConfirmedRevision,
    promoteToQuick,
    isSavingEnabled,
  } = usePreSaveOrchestrator({
    note,
    isOpen,
    request,
    activeDate,
    isDateNavEnabled,
    userId,
    onCalendarNoteCreated: handleCalendarNoteCreated,
    onGeneralNoteCreated: handleGeneralNoteCreated,
    onQuickNoteCreated: handleQuickNoteCreated,
  });

  /////////////////////////////////
  // Create-for-date → edit when a real note appears on the active day
  // (month refetch after 409 invalidate, or realtime insert while draft is clean).
  // Skip while conflict banner is up or autosave is blocked (keep create draft).
  useEffect(() => {
    if (!isOpen || !createDate || conflict || !isSavingEnabled) {
      return;
    }

    if (request?.mode !== "create" || !("date" in request)) {
      return;
    }

    const occupant =
      createMonthData?.monthNotes.find((entry) => entry.date === createDate) ??
      findNoteOnDateInCache(queryClient, createDate);

    if (!occupant?.id || isOptimisticNoteId(occupant.id)) {
      return;
    }

    openEdit(occupant.id);
  }, [
    conflict,
    createDate,
    createMonthData?.monthNotes,
    isOpen,
    isSavingEnabled,
    openEdit,
    queryClient,
    request,
  ]);

  const { goToPreviousDay, goToNextDay } = useDrawerDateNavigation({
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
  const {
    handleChangeWithDirty,
    showRemoteUpdateBanner,
    reloadRemoteForm,
    dismissRemoteBanner,
  } = useNoteDrawerRealtimeSync({
    isOpen,
    noteId,
    resetKey,
    onChange: handleChange,
    reevaluateFromCache,
    onRemoteFormSync: acceptRemoteFormSync,
    bumpFormReloadKey,
    getConfirmedRevision,
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

  /////////////////////////////////
  // Title — create draft vs persisted edit
  const title = request?.mode === "edit" ? "Edit note" : "New note";

  return (
    <AppDrawer
      ariaLabel={title}
      header={<DrawerTitle>{title}</DrawerTitle>}
      open={isOpen}
      resizable
      onOpenChange={handleOpenChange}
    >
      <div className="relative flex min-h-full flex-col">
        <NoteForm
          calendarDate={prefillCalendarDate}
          commitKey={commitKey}
          isQuickNote={isQuickNoteContext}
          note={note}
          formReloadKey={formReloadKey}
          resetKey={resetKey}
          saveStatus={saveStatus}
          showContentLastSaved={false}
          onChange={handleChangeWithDirty}
          onDatePick={handleDatePick}
          onDelete={note?.id ? handleDelete : undefined}
          onFooterMetaChange={handleFooterMetaChange}
          onSetQuick={canPromoteToQuick ? promoteToQuick : undefined}
        />

        <NoteDrawerFooter
          activeDate={activeDate}
          conflict={conflict}
          formattedLastEditedAt={footerMeta.formattedLastEditedAt}
          isDateNavEnabled={effectiveDateNavEnabled}
          saveFeedback={saveFeedback}
          saveStatus={saveStatus}
          showRemoteUpdateBanner={showRemoteUpdateBanner}
          onDismissRemoteBanner={dismissRemoteBanner}
          onNext={goToNextDay}
          onPrevious={goToPreviousDay}
          onReloadRemote={reloadRemoteForm}
          onResolveDismiss={resolveDismiss}
          onResolveReplace={resolveReplace}
        />
      </div>
    </AppDrawer>
  );
}
