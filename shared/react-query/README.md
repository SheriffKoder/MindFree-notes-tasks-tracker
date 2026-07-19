# TanStack Query (`shared/react-query`)

Generic TanStack Query infrastructure for the app. **Domain cache logic does
not live here** — each entity owns it in focused responsibility groups.

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
entities/<name>/client/*            Fetchers, keys, queryOptions, prefetch
entities/<name>/hooks/*             React query, mutation, and sync hooks
entities/<name>/cache/*             Cache transforms and synchronization
entities/<name>/hydration/*         SSR cache seeders
entities/<name>/server.ts           Server reads + seed* helpers
entities/<name>/queries/*           Repository-backed server use-cases (no TanStack)
```

### `entities/<name>/` — domain cache (per entity)

Each entity that needs client-side caching exposes runtime-safe entry points and
uses only the responsibility groups it needs:

| Entry | Runtime | Contents |
| ----- | ------- | -------- |
| `server.ts` | Server Components, API routes | `get*Response`, SSR cache seeders |
| `client.ts` | `"use client"` modules | query keys/options, fetchers, React hooks |
| `index.ts` | Any layer | Types and pure helpers only |

**Example (notes):**

```text
entities/note/
├── client/
│   ├── query-keys.ts                canonical cache keys
│   ├── *-notes-query.ts             fetchers + queryOptions
│   └── prefetch-*.ts                browser prefetch helpers
├── hooks/
│   ├── use-*-notes-query.ts         React query hooks
│   ├── use-*-note-mutation.ts       React mutation hooks
│   └── use-notes-realtime-sync.ts   realtime synchronization hook
├── cache/
│   ├── note-cache-mutations.ts      pure cache transforms
│   └── synchronize-note-caches.ts   read-model fan-out
└── hydration/
    ├── seed-notes-page-cache.ts     SSR setQueryData writer
    └── seed-home-notes-cache.ts     Home cache writer
```

Client components import from `entities/note/client`, never from `entities/note/server` or the main `index.ts` barrel when they need hooks (avoids bundling repository code).

These folder names describe responsibilities, not a locked vocabulary. Add a
focused group when a real boundary emerges; do not create a generic TanStack
dumping folder or force every entity to have every group.

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
const queryClient = getQueryClient();
seedNotesPageCache(queryClient, initialData); // entity writes; no dehydrate
return <QueryHydration state={dehydrate(queryClient)}>{null}</QueryHydration>;
```

> Composing multiple entities on one page (e.g. Home): call each entity's
> `seed*` writer against a single `getQueryClient()`, then `dehydrate` once and
> wrap in one `<QueryHydration>`. See `views/home/ui/home-hydration-seed.tsx`.

## Adding TanStack Query to a new page / entity

Use this checklist when wiring a new route (e.g. tasks, home quick note):

### 1. Entity layer

```text
entities/task/
├── client/
│   ├── query-keys.ts
│   └── tasks-query.ts              # fetchTasks + tasksQueryOptions
├── hooks/
│   └── use-tasks-query.ts          # useTasksQuery
├── cache/                          # add only when cache transforms/sync exist
├── hydration/
│   └── seed-tasks-cache.ts         # setQueryData only; void
├── client.ts                       # re-export client API + hooks + types
└── server.ts                       # getTasksResponse, seedTasksCache
```

- **Keys** — stable tuples, e.g. `["tasks", filter]` or `["task", id]`.
- **Fetcher** — `fetch` to `app/api/...` (same payload shape as the server query).
- **`queryOptions`** — shared between SSR prefetch and `useQuery`.
- **Seeders** — `setQueryData` with data already fetched on the server; return
  `void`. The route/view hydration boundary dehydrates the shared
  `QueryClient` once.

### 2. API route (if not already present)

Keep routes thin: auth → one `entities/<name>/server` function → JSON.

### 3. App route

Render a non-blocking server seed beside the client shell. The seed fetches,
writes through `hydration/`, dehydrates once, and returns `QueryHydration`.

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

Add React mutation hooks under `hooks/`, browser write fetchers under `client/`,
and reusable cache transforms or fan-out under `cache/`. Drawer and page
islands read from cache — they do not refetch the whole page.

## Rules of thumb

1. **`shared/react-query`** — QueryClient, app provider, hydration boundary, generic status UI. No domain keys.
2. **`app/(app)/layout.tsx`** — mount `AppQueryProvider` once for all protected routes.
3. **Entity responsibility groups** — `client/` for fetchers/keys/options/prefetch,
   `hooks/` for React hooks, `cache/` for transforms/sync, and `hydration/` for
   SSR seeders; add or omit groups according to actual responsibilities.
4. **`entities/*/client.ts`** — the only entity import path from `"use client"` code that needs hooks.
5. **`entities/*/server.ts`** — the only entity import path from Server Components and API routes.
6. **`views/*/lib`** — page-specific state resolution (which query blocks which view, copy, URL params).
7. **SSR** — server fetches once via repository; a seeder warms TanStack cache; the boundary dehydrates once; client `useQuery` reads hydrated or cached data.
8. **URL params** — resolve `month` / `view` on the client when toggling should not block the route on a server round-trip.

## Reference: notes page today

```text
app/(app)/layout.tsx
  AppQueryProvider

app/(app)/notes/page.tsx
  NotesHydrationSeed (parallel, non-blocking) + NotesClient

views/notes/ui/notes-client.tsx
  useNotesUrlState()             ← month/view state + URL navigation actions
  NotesViewsSection

views/notes/ui/notes-views-section.tsx
  useCalendarNotesQuery(month)   ← entities/note/client
  useGeneralNotesQuery()
  resolveViewQueryState()        ← views/notes/lib (notes-only)
  QueryStatePanel                ← shared/react-query
```

For deeper note-entity detail, see `entities/note/README.md`.
