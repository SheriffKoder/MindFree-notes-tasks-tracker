/**
 * @file features/notes/note-drawer/index.ts
 * Public exports for the Notes drawer island.
 */

export { shiftIsoDate } from "@/features/notes/note-drawer/lib/shift-iso-date";
export { useDrawerActiveDate } from "@/features/notes/note-drawer/model/use-drawer-active-date";
export { useDrawerDateNavigation } from "@/features/notes/note-drawer/model/use-drawer-date-navigation";
export { useDrawerMonthPrefetch } from "@/features/notes/note-drawer/model/use-drawer-month-prefetch";
export { useResolvedDrawerNote } from "@/features/notes/note-drawer/model/use-resolved-drawer-note";
export {
  NoteDrawer,
  type NoteDrawerProps,
} from "@/features/notes/note-drawer/ui/note-drawer";
export {
  NoteDrawerFooter,
  type NoteDrawerFooterProps,
} from "@/features/notes/note-drawer/ui/note-drawer-footer";
