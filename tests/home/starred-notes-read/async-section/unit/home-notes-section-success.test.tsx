/**
 * @file tests/home/starred-notes-read/async-section/unit/home-notes-section-success.test.tsx
 * Locks CHEAPEST.4 for Starred notes (read) — View — load home strips.
 *
 * Doc: docs/testing/home/2-starred-notes-read/async-section.md
 *      → section "View — load home strips"
 *      → decision table cell: **Should** × **Unit** × item 4 (CHEAPEST.4)
 *      → CHEAPEST TEST(s) #4
 *
 * Contract: fixture with ≥1 strip → category header + strip cards render;
 *           not loading / empty panels ([1]).
 *
 * Why this cell (not Integration / E2E): async-section practice is mock-only;
 * cheapest proof of the success branch mounting strip UI from cache data.
 *
 * What stays real: `HomeNotesSection` success → `HomeNotesStripArea` header + strip.
 * What is mocked: home-notes query payload (and sibling hooks / drawer shell).
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  FIXTURE_HOME_NOTES_WITH_STRIP,
  FIXTURE_HOME_STRIP_DIARY,
  FIXTURE_STARRED_NOTE,
} from "@/tests/home/fixtures";

/////////////////////////////////////////////////////////////
// Boundary mocks — network/query + side-effect hooks stay out of the SUT.
/////////////////////////////////////////////////////////////

// CHEAPEST.4 boundary: settled success with ≥1 strip.
vi.mock("@/entities/note/hooks/use-home-notes-query", () => ({
  useHomeNotesQuery: () => ({
    data: FIXTURE_HOME_NOTES_WITH_STRIP,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

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

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

describe("HomeNotesSection — Starred notes read async (CHEAPEST.4)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.4 — Should × Unit (async mock)
  // Doc cell why: proves success path mounts strip UI from fixture props/cache.
  // Flow step under test: [1] HomeNotesSection → strip header + cards.
  // Protects: ≥1 strip shows category switcher + starred card, not loading/empty.
  // Regression: stuck on loading/empty while strips exist in the query result.

  it("renders category header and starred card when strips are present", () => {
    renderWithQueryClient(<HomeNotesSection />);

    expect(
      screen.getByRole("button", {
        name: `Show ${FIXTURE_HOME_STRIP_DIARY.categoryName} notes`,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(FIXTURE_STARRED_NOTE.content)).toBeInTheDocument();
    expect(screen.getByText(FIXTURE_STARRED_NOTE.title)).toBeInTheDocument();

    expect(screen.queryByText("Loading notes…")).not.toBeInTheDocument();
    expect(
      screen.queryByText("No note categories on Home."),
    ).not.toBeInTheDocument();
  });
});
