/**
 * @file shared/view-switcher/index.ts
 * Public exports for the view switcher shared module.
 */

export {
  DEFAULT_NOTES_VIEW,
  NOTE_VIEWS,
  getNextNotesView,
  getNotesViewDefinition,
  parseNotesViewParam,
  type NotesViewDefinition,
  type NotesViewId,
} from "@/shared/view-switcher/lib/note-views";
export {
  useViewNavigation,
  type UseViewNavigationOptions,
  type UseViewNavigationResult,
} from "@/shared/view-switcher/model/use-view-navigation";
export {
  ViewSwitcher,
  type ViewSwitcherProps,
} from "@/shared/view-switcher/ui/view-switcher";
