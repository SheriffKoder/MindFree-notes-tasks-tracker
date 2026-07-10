# TanStack Query (`shared/react-query`)

Generic TanStack Query infrastructure for the app. **Domain cache logic does not live here** — each entity owns its own keys, fetchers, hooks, and hydration helpers under `entities/<name>/tanstack/`.

Import from `shared/react-query/index.ts` for app-wide query plumbing only.

## What lives here (reusable)

| File | Role |
| ---- | ---- |
| `lib/get-query-client.ts` | `QueryClient` factory — fresh per server request, singleton in the browser |
| `ui/app-query-provider.tsx` | App-wide `QueryClientProvider` (lives in `app/(app)/layout.tsx`) |
| `ui/query-hydration.tsx` | `HydrationBoundary` for SSR-dehydrated cache merges |
| `ui/query-state-panel.tsx` | Centered loading / error message for query-driven islands |

These are **not** tied to notes, tasks, or any single entity. Any page that uses TanStack Query can import them.

## What lives elsewhere

TanStack touches three layers. Keep each layer's responsibility narrow:

```text
app/(app)/layout.tsx                AppQueryProvider (persistent QueryClient)
app/(app)/<route>/page.tsx          Sync shell + optional non-blocking hydration seed
views/<page>/ui/*                   useSearchParams + useQuery (no server on ?param= change)
        ↓ imports hooks from
entities/<name>/client.ts           Public client API for the entity
entities/<name>/tanstack/*          Keys, API fetchers, queryOptions, useQuery hooks
entities/<name>/server.ts           Server reads + hydrate* helpers
entities/<name>/queries/*           Repository-backed server use-cases (no TanStack)
```

### `entities/<name>/` — domain cache (per entity)

Each entity that needs client-side caching gets a `tanstack/` folder and two entry points:

| Entry | Runtime | Contents |
| ----- | ------- | -------- |
| `server.ts` | Server Components, API routes | `get*Response`, `hydrate*Queries` |
| `client.ts` | `"use client"` modules | query keys, fetchers, `use*Query` hooks |
| `index.ts` | Any layer | Types and pure helpers only |

**Example (notes):**

```text
entities/note/tanstack/
├── query-keys.ts                    ["calendarNotes", month], ["generalNotes"]
├── calendar-notes-query.ts          fetch + queryOptions + useCalendarNotesQuery
├── general-notes-query.ts           fetch + queryOptions + useGeneralNotesQuery
└── hydrate-notes-page-queries.ts    setQueryData + dehydrate (exported via server.ts)
```

Client components import from `entities/note/client`, never from `entities/note/server` or the main `index.ts` barrel when they need hooks (avoids bundling repository code).

### `views/<page>/` — page glue (per route)

View-layer code wires entity hooks to UI. It should **not** define query keys or fetchers.

| Location | Typical contents |
| -------- | ---------------- |
| `views/notes/model/use-notes-url-state.ts` | `month` / `view` from `useSearchParams` (client-only) |
| `views/notes/ui/notes-views-section.tsx` | `useCalendarNotesQuery`, `useGeneralNotesQuery` |
| `views/notes/lib/resolve-view-query-state.ts` | Page-specific loading/error mapping (notes views + copy) |

`resolve-view-query-state.ts` is notes-specific because it knows about `NotesViewId` and note response shapes. A tasks page would get its own resolver under `views/tasks/lib/` if needed.

### `app/(app)/<route>/page.tsx` — SSR seed + client shell

Keep the route page **sync** when URL search params drive UI (`?month=`, `?view=`). Resolve those on the client so toggles do not re-run the server page or flash route Suspense.

1. Wrap the protected app in `AppQueryProvider` once (`app/(app)/layout.tsx`).
2. Optionally render a **non-blocking** async hydration seed in parallel with the client shell.
3. Client reads URL params and `useQuery` — cached data renders immediately on return visits.

```tsx
// app/(app)/notes/page.tsx
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
```

```ts
// notes-hydration-seed.tsx (server)
const initialData = await getNotesPageInitialData(null);
const dehydratedState = hydrateNotesPageQueries(getQueryClient(), initialData);
return <QueryHydration state={dehydratedState}>{null}</QueryHydration>;
```

## Adding TanStack Query to a new page / entity

Use this checklist when wiring a new route (e.g. tasks, home quick note):

### 1. Entity layer

```text
entities/task/
├── tanstack/
│   ├── query-keys.ts
│   ├── tasks-query.ts              # fetchTasks, tasksQueryOptions, useTasksQuery
│   └── hydrate-tasks-page-queries.ts
├── client.ts                       # re-export tanstack hooks + types
└── server.ts                       # getTasksResponse, hydrateTasksPageQueries
```

- **Keys** — stable tuples, e.g. `["tasks", filter]` or `["task", id]`.
- **Fetcher** — `fetch` to `app/api/...` (same payload shape as the server query).
- **`queryOptions`** — shared between SSR prefetch and `useQuery`.
- **`hydrate*`** — `setQueryData` with data already fetched on the server; return `dehydrate(queryClient)`.

### 2. API route (if not already present)

Keep routes thin: auth → one `entities/<name>/server` function → JSON.

### 3. App route

`page.tsx` → fetch → `getQueryClient()` → hydrate → pass `dehydratedState` to the view.

### 4. View layer

```tsx
// app/(app)/tasks/page.tsx — sync; no searchParams on server
<Suspense fallback={null}>
  <TasksClient />
</Suspense>

// views/tasks/ui/tasks-client.tsx
const { data, isPending, isError } = useTasksQuery(filter);

if (isError) return <QueryStatePanel variant="error" message="..." />;
if (isPending && !data) return <QueryStatePanel message="Loading…" />;
```

### 5. Mutations (later steps)

Add `entities/<name>/tanstack/*-mutation.ts` or `mutations/` hooks that call `queryClient.setQueryData` / `invalidateQueries` on the **owning key only**. Drawer and page islands read from cache — they do not refetch the whole page.

## Rules of thumb

1. **`shared/react-query`** — QueryClient, app provider, hydration boundary, generic status UI. No domain keys.
2. **`app/(app)/layout.tsx`** — mount `AppQueryProvider` once for all protected routes.
3. **`entities/*/tanstack`** — keys, fetchers, hooks, hydrate helpers for that domain.
3. **`entities/*/client.ts`** — the only entity import path from `"use client"` code that needs hooks.
4. **`entities/*/server.ts`** — the only entity import path from Server Components and API routes.
5. **`views/*/lib`** — page-specific state resolution (which query blocks which view, copy, URL params).
6. **SSR** — server fetches once via repository; hydrate seeds TanStack cache; client `useQuery` reads hydrated or cached data.
7. **URL params** — resolve `month` / `view` on the client when toggling should not block the route on a server round-trip.

## Reference: notes page today

```text
app/(app)/layout.tsx
  AppQueryProvider

app/(app)/notes/page.tsx
  NotesHydrationSeed (parallel, non-blocking) + NotesClient

views/notes/ui/notes-client.tsx
  useNotesUrlState()             ← month/view from useSearchParams
  NotesViewsSection

views/notes/ui/notes-views-section.tsx
  useCalendarNotesQuery(month)   ← entities/note/client
  useGeneralNotesQuery()
  resolveViewQueryState()        ← views/notes/lib (notes-only)
  QueryStatePanel                ← shared/react-query
```

For deeper note-entity detail, see `entities/note/README.md`.
