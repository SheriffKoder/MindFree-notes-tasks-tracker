/**
 * @file features/notes/note-drawer/ui/note-drawer.tsx
 * Notes drawer island — shell, editor, date navigation, and cache resolution.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import { NoteForm } from "@/entities/note/editor";
import type { NoteFormFooterMeta } from "@/entities/note/editor/model/types";
import { AppDrawer } from "@/shared/drawer";
import { useDrawerActiveDate } from "@/features/notes/note-drawer/model/use-drawer-active-date";
import { useDrawerDateNavigation } from "@/features/notes/note-drawer/model/use-drawer-date-navigation";
import { useDrawerMonthPrefetch } from "@/features/notes/note-drawer/model/use-drawer-month-prefetch";
import { useNoteDrawerMutations } from "@/features/notes/note-drawer/model/use-note-drawer-mutations";
import { useResolvedDrawerNote } from "@/features/notes/note-drawer/model/use-resolved-drawer-note";
import { NoteDrawerFooter } from "@/features/notes/note-drawer/ui/note-drawer-footer";
import type { UseNotesDrawerResult } from "@/views/notes/model/editor/use-notes-drawer";

export interface NoteDrawerProps {
  /** Page-level drawer open/close state and editor request. */
  drawer: UseNotesDrawerResult;
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
export function NoteDrawer({ drawer }: NoteDrawerProps) {
  const { isOpen, request, setOpen, openEdit } = drawer;
  const [footerMeta, setFooterMeta] =
    useState<NoteFormFooterMeta>(INITIAL_FOOTER_META);

  const { activeDate, isDateNavEnabled, setActiveDate } = useDrawerActiveDate(
    request,
    isOpen,
  );
  const note = useResolvedDrawerNote(request, activeDate, isDateNavEnabled);
  const { goToPreviousDay, goToNextDay, swipeHandlers } =
    useDrawerDateNavigation({
      activeDate,
      isDateNavEnabled,
      setActiveDate,
    });

  useDrawerMonthPrefetch(activeDate, isDateNavEnabled);

  const handleGeneralNoteCreated = useCallback(
    (noteId: string) => {
      openEdit(noteId);
    },
    [openEdit],
  );

  const { saveStatus, handleChange, commitKey } = useNoteDrawerMutations({
    note,
    isOpen,
    request,
    activeDate,
    isDateNavEnabled,
    onGeneralNoteCreated: handleGeneralNoteCreated,
  });

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

    if (request?.mode === "create" && "date" in request) {
      return `date:${request.date}`;
    }

    if (request?.mode === "edit") {
      return `edit:${request.noteId}`;
    }

    return "draft";
  }, [activeDate, note?.id, request]);

  const handleFooterMetaChange = useCallback((meta: NoteFormFooterMeta) => {
    setFooterMeta(meta);
  }, []);

  return (
    <AppDrawer
      ariaLabel="Note editor"
      open={isOpen}
      onOpenChange={setOpen}
    >
      <div
        className="flex min-h-full flex-col"
        {...(swipeHandlers ?? {})}
      >
        <NoteForm
          commitKey={commitKey}
          note={note}
          resetKey={resetKey}
          saveStatus={saveStatus}
          showContentLastSaved={false}
          onChange={handleChange}
          onFooterMetaChange={handleFooterMetaChange}
        />

        <NoteDrawerFooter
          activeDate={activeDate}
          formattedLastEditedAt={footerMeta.formattedLastEditedAt}
          isDateNavEnabled={isDateNavEnabled}
          saveStatus={footerMeta.saveStatus}
          onNext={goToNextDay}
          onPrevious={goToPreviousDay}
        />
      </div>
    </AppDrawer>
  );
}
