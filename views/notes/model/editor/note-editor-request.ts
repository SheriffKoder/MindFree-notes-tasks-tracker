/**
 * @file views/notes/model/editor/note-editor-request.ts
 * Describes what the Notes editor should do when the drawer opens.
 *
 * Notes are not created until the user types or saves — requests only describe intent.
 */

/** Editor intent passed from the Notes page into the drawer island. */
export type NoteEditorRequest =
  | {
      mode: "edit";
      noteId: string;
    }
  | {
      mode: "create";
      date: string;
    }
  | {
      mode: "create";
      general: true;
    };

/** Local drawer state owned by {@link useNotesDrawer}. */
export interface NotesDrawerState {
  isOpen: boolean;
  request: NoteEditorRequest | null;
}
