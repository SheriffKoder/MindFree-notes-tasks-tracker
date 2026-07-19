/**
 * @file features/activity/activity-page/model/use-activity-definition-drawer.ts
 * Definition drawer UI state — open/close and the current create-vs-edit request.
 *
 * Presentation-only: does not fetch activities or create rows. Kind is owned by
 * the mounting page and never part of the request.
 */

"use client";

import { useCallback, useState } from "react";

import type {
  ActivityDrawerController,
  ActivityEditorRequest,
} from "@/features/activity/activity-drawer";

/** Local drawer state owned by {@link useActivityDefinitionDrawer}. */
export interface ActivityDefinitionDrawerState {
  isOpen: boolean;
  request: ActivityEditorRequest | null;
}

export type UseActivityDefinitionDrawerResult = ActivityDrawerController;

const INITIAL_STATE: ActivityDefinitionDrawerState = {
  isOpen: false,
  request: null,
};

/**
 * Manages definition drawer visibility and the active editor request.
 */
export function useActivityDefinitionDrawer(): UseActivityDefinitionDrawerResult {
  const [state, setState] =
    useState<ActivityDefinitionDrawerState>(INITIAL_STATE);

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
