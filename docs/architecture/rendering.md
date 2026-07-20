# Rendering

How MindFree splits server rendering and client interactivity — and where hydration fits.

**Decision:** [ADR 0003](../adr/0003-rsc-first-with-query-hydration.md)  
**Cache detail:** [caching.md](./caching.md)

---

## Default: Server Components

Protected routes under `app/(app)/` are Server Components by default. They are good for:

- Auth checks in layouts
- One-shot reads with cookies + RLS (hydrate seeds)
- Shipping less JS for chrome that does not need interactivity

They are **bad** for:

- Debounced autosave and optimistic UI
- URL search-param driven month/view toggles that should not remount the page
- Realtime subscriptions and offline listeners

So the app is **RSC-first with explicit client islands**, not “everything client” and not “everything server.”

---

## Client islands

| Island | Why client |
| ------ | ---------- |
| Notes / Home view shells | `useSearchParams`, `useQuery`, open drawer |
| Note drawer | Form, date nav, orchestrator, mutations |
| Theme switcher, offline banner | Browser APIs + local state |
| Home aside drawer shell | Open state without re-fetching the page tree |
| Progress month navigator | URL `?month=` + adjacent RSC prefetch only |

Import `"use client"` modules from views/features; keep entity **server** code out of those bundles via `client.ts` vs `server.ts` barrels.

---

## Hydration boundary

```text
app/(app)/layout.tsx
  AppQueryProvider          ← one browser QueryClient

app/(app)/notes/page.tsx    ← sync shell
  NotesHydrationSeed        ← server: fetch + dehydrate (Suspense, non-blocking)
  NotesClient               ← client: URL + queries + drawer
```

SSR seeds warm TanStack; the interactive island reads the same keys. The page shell stays sync so `?month=` / `?view=` changes do not re-run the Server Component for every toggle ([routing.md](./routing.md)).

### Exception: Progress

`/progress` is the pure-SSR report path: the Server Component fetches and
renders the month; there is no TanStack hydrate. Details:
[views/progress/docs/data-flow.md](../../views/progress/docs/data-flow.md).

---

## What not to remount

Avoid patterns that remount the whole Notes experience on every keystroke or day swipe:

- `router.refresh()` after each autosave
- Putting drawer field state only in server props
- Making the entire page a single client component that re-fetches all notes on open

Local form state + optimistic cache updates keep typing smooth; remote form pulls are gated ([optimistic-updates](../../entities/note/docs/optimistic-updates.md)).

---

## Related

| Doc | Why |
| --- | --- |
| [state-management.md](./state-management.md) | Which state is URL vs Query vs ephemeral |
| [shared/react-query/README.md](../../shared/react-query/README.md) | Provider + hydration helpers |
| [views/progress/docs/data-flow.md](../../views/progress/docs/data-flow.md) | Pure-SSR Progress exception |
| [ADR 0004](../adr/0004-url-owned-application-state.md) | Client URL ownership |
