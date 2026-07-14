# Routing

How App Router groups, auth gates, and Notes URL params interact.

**URL state decision:** [ADR 0004](../adr/0004-url-owned-application-state.md)  
**Auth architecture:** [ADR 0001](../adr/0001-auth-architecture.md)  
**Security layers:** [guides/security.md](../guides/security.md)

---

## Route groups

| Path | Role |
| ---- | ---- |
| `app/(auth)/login`, `signup` | Public auth pages |
| `app/auth/callback`, `confirm` | Server-side OAuth / email confirm |
| `app/(app)/*` | Protected app shell (`/`, `/notes`, `/tasks`, …) |
| `app/api/*` | JSON APIs (401 when unauthenticated) |

`(app)` layout mounts `AppQueryProvider` and a second session check. Edge/`proxy.ts` refreshes cookies and blocks guests before most handlers run.

---

## Notes URL shape

```text
/notes?month=YYYY-MM&view=calendar|month-notes|general-notes
```

| Param | Owner | Effect |
| ----- | ----- | ------ |
| `month` | Client URL hook | Selects `["calendarNotes", month]` for calendar / month-notes |
| `view` | Client URL hook | Which presentation to show |

**Not in the URL:** drawer open, drawer `activeDate`, form drafts. Drawer day browsing must not rewrite page `month` ([drawer-navigation](../../views/notes/docs/drawer-navigation.md)).

---

## Why the Notes page is sync

Making `page.tsx` async on `searchParams` would remount or suspense the tree on every month/view click. Instead:

1. Sync route renders client shell (+ optional parallel hydrate seed).
2. Client reads `useSearchParams` and navigates with shallow URL updates.
3. TanStack fetches/misses by key — adjacent months often already prefetched.

---

## Safe redirects

| Case | Behavior |
| ---- | -------- |
| Guest hits protected page | Redirect `/login` (proxy + layout) |
| Guest hits `/api/*` | JSON `401` (not HTML login page) |
| Signed-in user hits login | Redirect into app (proxy) |

Post-login return paths should stay **same-origin safe** (`shared/lib/auth/get-safe-path.ts`).

---

## Related

| Doc | Why |
| --- | --- |
| [rendering.md](./rendering.md) | Sync shell + client islands |
| [state-management.md](./state-management.md) | Three state buckets |
| [docs/setup/0-quick-setup.md](../setup/0-quick-setup.md) | Local env for auth routes |
