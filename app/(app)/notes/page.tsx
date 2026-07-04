/**
 * @file app/(app)/notes/page.tsx
 * Protected notes route that composes the notes page inside the shared shell.
 */

import { NotesView } from "@/views/notes";

/**
 * Renders the protected notes route.
 *
 * @returns Notes route composition for `/notes`
 */
export default function NotesRoute() {
  return <NotesView />;
}
