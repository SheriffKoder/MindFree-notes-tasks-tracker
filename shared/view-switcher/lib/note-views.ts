/**
 * @file shared/view-switcher/lib/note-views.ts
 * Notes page view parsing and navigation helpers.
 */

import {
  DEFAULT_NOTES_VIEW,
  NOTE_VIEWS,
  type NotesViewDefinition,
  type NotesViewId,
} from "@/shared/view-switcher/lib/note-views-config";

export type { NotesViewDefinition, NotesViewId } from "@/shared/view-switcher/lib/note-views-config";
export {
  DEFAULT_NOTES_VIEW,
  NOTE_VIEWS,
} from "@/shared/view-switcher/lib/note-views-config";

/**
 * Resolves a raw search param into a valid Notes view id.
 *
 * @param value - raw `view` search param
 * @returns validated view id
 */
export function parseNotesViewParam(value: string | undefined): NotesViewId {
  if (value && NOTE_VIEWS.some((view) => view.id === value)) {
    return value as NotesViewId;
  }

  return DEFAULT_NOTES_VIEW;
}

/**
 * Returns the definition for a view id.
 *
 * @param id - Notes view id
 * @returns matching view definition
 */
export function getNotesViewDefinition(id: NotesViewId): NotesViewDefinition {
  const definition = NOTE_VIEWS.find((view) => view.id === id);

  if (!definition) {
    return NOTE_VIEWS[0];
  }

  return definition;
}

/**
 * Returns the next view in the mobile cycle order.
 *
 * @param current - current view id
 * @returns next view id
 */
export function getNextNotesView(current: NotesViewId): NotesViewId {
  const currentIndex = NOTE_VIEWS.findIndex((view) => view.id === current);
  const nextIndex = (currentIndex + 1) % NOTE_VIEWS.length;

  return NOTE_VIEWS[nextIndex]?.id ?? DEFAULT_NOTES_VIEW;
}
