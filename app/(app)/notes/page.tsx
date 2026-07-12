/**
 * @file app/(app)/notes/page.tsx
 * Protected notes route — sync shell; URL params and query reads stay on the client.
 */

import { Suspense } from "react";

import { NotesHydrationSeed } from "@/app/(app)/notes/notes-hydration-seed";
import { NotesClient } from "@/views/notes/ui/notes-client";

/**
 * Renders the Notes route. SSR hydration seeds cache in parallel with the client shell.
 * `?month=` and `?view=` toggles update client state only (no route Suspense flash).
 */
export default function NotesRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <NotesHydrationSeed />
      </Suspense>
      <Suspense fallback={null}>
        <NotesClient />
      </Suspense>
    </>
  );
}
