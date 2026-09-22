/**
 * @file tests/home/note-edit-write/persist-and-refresh/unit/home-notes-section-cache-to-ui.test.tsx
 * Locks CHEAPEST.3 for Note edit (write) — Edit — PATCH persists + Home strip reflects.
 *
 * Doc: docs/testing/home/5-note-edit-write/persist-and-refresh.md
 *      → section "Edit — PATCH persists + Home strip reflects"
 *      → decision table cell: **Should** × **Unit** × item 3 (CHEAPEST.3)
 *      → CHEAPEST TEST(s) #3
 *
 * Contract: **proves:** Home UI reflected the cache — real `useHomeNotesQuery`
 *           + seeded/updated `homeNotesQueryKey` → strip shows new text ([6]).
 *
 * Why this cell (not Integration / E2E): cheapest proof of cache → UI via the
 * real TanStack subscription. Mocked-hook strip render is Priority 2 async;
 * cache-only sync is CHEAPEST.2.
 *
 * What stays real: `useHomeNotesQuery` → `HomeNotesSection` strip cards.
 * What is mocked: network fetcher, categories/realtime/offline, drawer shell.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { synchronizeNoteCaches } from "@/entities/note/cache/synchronize-note-caches";
import { homeNotesQueryKey } from "@/entities/note/client/query-keys";
import type { Note } from "@/entities/note/model/types";
import {
  FIXTURE_HOME_NOTES_WITH_STRIP,
  FIXTURE_STARRED_NOTE,
} from "@/tests/home/fixtures";

/////////////////////////////////////////////////////////////
// Edited note — same id as fixture; new title/content shown after cache sync.
/////////////////////////////////////////////////////////////

const UPDATED_STARRED_NOTE: Note = {
  ...FIXTURE_STARRED_NOTE,
  title: "Fixture starred title — after save",
  content: "Fixture starred body — Home UI reflected the cache",
  lastEditedAt: "2026-09-21T12:00:00.000Z",
  revision: 2,
};

/////////////////////////////////////////////////////////////
// Boundary mocks — keep real useHomeNotesQuery; block network + side effects.
/////////////////////////////////////////////////////////////

// Fail loudly if TanStack tries to hit the network instead of the seeded cache.
vi.mock("@/entities/note/client/home-notes-query", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/entities/note/client/home-notes-query")>();

  return {
    ...actual,
    fetchHomeNotes: vi.fn(async () => {
      throw new Error(
        "fetchHomeNotes must not run — CHEAPEST.3 reads seeded homeNotesQueryKey",
      );
    }),
  };
});

vi.mock("@/entities/note/category/hooks/use-note-categories-query", () => ({
  useNoteCategoriesQuery: () => ({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock("@/entities/note/hooks/use-notes-realtime-sync", () => ({
  useNotesRealtimeSync: () => undefined,
}));

vi.mock("@/shared/offline-queue", () => ({
  useAuthUserId: () => null,
  useOfflineSync: () => undefined,
}));

vi.mock("@/entities/note/offline", () => ({
  createNotesOfflineSyncAdapter: () => ({
    entity: "notes",
    merge: () => undefined,
  }),
}));

vi.mock("@/features/notes/note-drawer", () => ({
  NoteDrawer: () => null,
}));

vi.mock("@/features/notes/note-drawer/model/note-realtime-drawer-bridge", () => ({
  notifyNoteDrawerRealtime: () => undefined,
}));

vi.mock("@/views/home/ui/home-payment-quick-add", () => ({
  HomePaymentQuickAdd: () => null,
}));

import { HomeNotesSection } from "@/views/home/ui/home-notes-section";

function renderHomeNotesFromCache(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(<HomeNotesSection />, { wrapper: Wrapper });
}

describe("HomeNotesSection — Note edit write persist (CHEAPEST.3)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.3 — Should × Unit (component / cache → UI)
  // Doc cell why: proves cache → UI — real query subscription, not a mocked hook.
  // Flow step under test: [6] HomeNotesSection / useHomeNotesQuery from cache.
  // Protects: after cache sync, strip cards show the new title/content.
  // Regression: cache has `next` but UI still shows previous fixture text.

  it("shows updated strip text after synchronizeNoteCaches patches homeNotesQueryKey", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });

    // Arrange — seed Home cache the way SSR / a prior read would.
    queryClient.setQueryData(
      homeNotesQueryKey,
      structuredClone(FIXTURE_HOME_NOTES_WITH_STRIP),
    );

    renderHomeNotesFromCache(queryClient);

    // Sanity — UI is driven by the seeded cache (real useHomeNotesQuery).
    expect(
      screen.getByText(FIXTURE_STARRED_NOTE.content),
    ).toBeInTheDocument();
    expect(screen.getByText(FIXTURE_STARRED_NOTE.title)).toBeInTheDocument();

    // Act — same Home sync path as after a successful note update.
    act(() => {
      synchronizeNoteCaches(queryClient, {
        type: "update",
        previous: FIXTURE_STARRED_NOTE,
        next: UPDATED_STARRED_NOTE,
      });
    });

    // Assert — strip UI re-renders from the updated cache entry.
    await waitFor(() => {
      expect(
        screen.getByText(UPDATED_STARRED_NOTE.content),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(UPDATED_STARRED_NOTE.title)).toBeInTheDocument();
    expect(
      screen.queryByText(FIXTURE_STARRED_NOTE.content),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(FIXTURE_STARRED_NOTE.title),
    ).not.toBeInTheDocument();
  });
});
