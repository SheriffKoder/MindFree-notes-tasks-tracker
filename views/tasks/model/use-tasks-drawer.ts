/**
 * @file views/tasks/model/use-tasks-drawer.ts
 * Tasks drawer UI state — open/close and the current create-vs-edit request.
 *
 * Presentation-only: does not fetch activities or create rows. The drawer shell
 * interprets {@link ActivityEditorRequest}. Kind is fixed by the Tasks page
 * (`task`) and never part of the request.
 */

"use client";

import { useCallback, useState } from "react";

/**
 * Editor intent passed from the Tasks page into the drawer island.
 *
 * Two variants only — Activity has no date/general/quick create contexts.
 */
export type ActivityEditorRequest =
  | {
      mode: "edit";
      activityId: string;
    }
  | {
      mode: "create";
    };

/** Local drawer state owned by {@link useTasksDrawer}. */
export interface TasksDrawerState {
  isOpen: boolean;
  request: ActivityEditorRequest | null;
}

export interface UseTasksDrawerResult {
  isOpen: boolean;
  request: ActivityEditorRequest | null;
  /** Opens the editor for a new activity draft (`kind = task` at save time). */
  openCreate: () => void;
  /** Opens the editor for an existing activity. */
  openEdit: (activityId: string) => void;
  /** Closes the drawer without clearing the last request. */
  close: () => void;
  /** Maps to `AppDrawer` `onOpenChange` — closes when `open === false`. */
  setOpen: (open: boolean) => void;
}

const INITIAL_STATE: TasksDrawerState = {
  isOpen: false,
  request: null,
};

/**
 * Manages Tasks drawer visibility and the active editor request.
 */
export function useTasksDrawer(): UseTasksDrawerResult {
  const [state, setState] = useState<TasksDrawerState>(INITIAL_STATE);

  const openCreate = useCallback(() => {
    setState({
      isOpen: true,
      request: { mode: "create" },
    });
  }, []);

  const openEdit = useCallback((activityId: string) => {
    setState({
      isOpen: true,
      request: { mode: "edit", activityId },
    });
  }, []);

  const close = useCallback(() => {
    setState((previous) => ({ ...previous, isOpen: false }));
  }, []);

  const setOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        close();
      }
    },
    [close],
  );

  return {
    isOpen: state.isOpen,
    request: state.request,
    openCreate,
    openEdit,
    close,
    setOpen,
  };
}
