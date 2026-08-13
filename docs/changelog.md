# Changelog

Product and architecture notes for shipped behavior changes. Newest first.

Build-history plans may still live under `app/development/changelogs/`; this file is the durable **WHAT / WHY** record for the docs tree.

---

## 2026-08-11 — Notes multi-device sync (revision + open drawers)

Two devices could both show an open note drawer, yet edits on one often never
landed in the other’s form — while background list cards *did* update. Saving
from the stale drawer could silently overwrite the newer remote version.
Separately, creating a calendar note when the client cache missed an existing
same-day row looped on `409 A note already exists on this date.`

**What we shipped:**

| Piece | Role |
| ----- | ---- |
| `mf_notes.revision` (+ migration `040`) | Monotonic concurrency token; PATCH sends `expectedRevision` |
| Stale write `409` | Reject outdated PATCH; reload form from server note |
| Clean vs dirty drawer policy | Clean → always pull remote into fields; dirty → banner (“Updated on another device”), never clobber typing |
| `formReloadKey` + confirmed-revision session store | One reload counter; token never invented from optimistic cache |
| Same-day `DATE_CONFLICT` | `409` returns full occupant `note`; seed cache, conflict footer, stop create loop |
| `useResolvedDrawerNote` | Re-read cache every render (no request-only memo) so form reload sees the realtime row |

**Plan / review:** [app/development/changelogs/saving-issues/architecture-review.md](../app/development/changelogs/saving-issues/architecture-review.md)

### Reflections

- **Cards updating ≠ drawer updating.** Realtime patched TanStack lists correctly, but the open form only reloads on an explicit `formReloadKey` bump *and* must read a fresh `Note`. Memoizing resolve on `[queryClient, request]` kept a stale snapshot after `setQueryData`, so Device B “synced” its revision token while still showing old fields.
- **`lastEditedAt` is a bad concurrency token.** Optimistic bumps and `timestamptz` equality made same-device / mixed-version clients fail to save. Integer `revision` (server-only increment) is the write gate; timestamps stay display/sort only.
- **Idle timers and typing gates fought the product.** A clean open drawer should collaborate; a dirty one should warn, not freeze editing. Dropped idle “maybe sync” windows and the proposed typing gate.
- **Cache miss on create is a UX loop, not just an error toast.** If evaluate-save thinks the day is empty, POST/`create-calendar` 409s forever. Treat same-day conflict like replace/dismiss: clear pending creates, seed the occupant, optionally promote create → edit when a real id appears.
- **Deploy order matters.** Clients that send `expectedRevision` need migration `040` applied first; older clients without the column/token path will not interoperate cleanly with the new PATCH contract.

---

## 2026-08-02 — Calendar cursor hover tip (desktop)

Notes, Tasks, and Reminders month calendars gain a desktop-only peek on cell
hover: a cursor-following panel that joins `store.date` to the pane’s already
loaded `calendarDays` (no fetch inside the tip).

**Interaction:** follow while scrubbing cells → freeze when the pointer enters
the tip → on tip leave, resolve via `elementFromPoint` (retarget or close).
Wheel over the calendar scrolls the tip. Click / month change clears it.

**Shared surface:** `@/shared/calendar` (`calendar-hover-store`,
`CalendarCursorTooltip`, `MonthCalendar` hover callbacks). Feature bodies stay
outside the package (`NoteCalendarHoverContent`, `ActivityCalendarHoverContent`).

Portable wiring guide: [shared/calendar/README.md](../shared/calendar/README.md).

---

## 2026-07-27 — Live “today” on tab focus

Long-lived SPA tabs were freezing Home / Tasks “today” at the day of first mount. After midnight the list stayed on yesterday until a full remount.

**Clean cut:**

| API | Owns |
| --- | ---- |
| `getTodayIsoDate()` | Pure one-shot / server / form defaults |
| `useLocalTodayIsoDate()` | Wall-clock day via a shared store; refreshes on `visibilitychange` + `focus` |
| `useTodayIsoDate()` | App “today” — demo fixed date, else live local day |

One browser listener set (`shared/lib/today/live-today-store.ts`); React subscribers use `useSyncExternalStore`. Home Today and quick-record already go through `useTodayIsoDate`, so they pick up the roll without per-feature midnight logic.

---

## 2026-07-27 — Home Add note vs quick slot

Home header **Add note** no longer opens `create-quick`. It opens `create-general`, same idea as the Notes page add button.

**Why:** There is only one quick note per user. Opening create-quick from Add while the slot was already filled caused an optimistic overwrite of the strip card, then a unique-constraint failure and rollback — the old quick note “came back.” Adding a title or date seemed to “unlock” save only because those paths switched to general/calendar create.

**Now:**

- Empty quick placeholder → `create-quick` (or edit the existing quick if the slot is already filled)
- Header Add note → `create-general`
- Create-quick + title/date graduation keeps those fields instead of wiping them
- Non-quick empty title shows a short hint in the editor

---

## 2026-07-27 — Notes drawer: remove day swipe

Removed horizontal swipe day navigation from the notes drawer (`useDrawerDateNavigation` / `NoteDrawer`). Prev/next footer buttons remain the only way to move between calendar days.

Swipe needs more design work around **drag interactions** (threshold vs scroll, conflict with drawer resize/pan, accidental day changes while editing). Until that is settled, buttons-only keeps day nav predictable.

---

## 2026-07-24 — Cross-tab auth session sync

Added to the **root layout** (`app/layout.tsx`) an `AuthSessionSync` client island (`features/auth/session-expiry`) that keeps the browser URL aligned with the Supabase session after long-idle tabs and cross-tab sign-in / sign-out.

It uses `reconcileAuthNavigation` from `shared/lib/auth/reconcile-auth-navigation.ts`:

| Session | Current route | Action |
| ------- | ------------- | ------ |
| none | app routes | hard navigate to `/login?error=session_missing&next=…` |
| active | `/login` or `/signup` | hard navigate to safe `next` or `/` |
| otherwise | — | no-op |

Triggers:

- `onAuthStateChange` for `SIGNED_IN` / `SIGNED_OUT` only (ignores `INITIAL_SESSION` and `TOKEN_REFRESHED`)
- `visibilitychange` (when visible) and `window` `focus` → `getSession()` then reconcile, so a background tab catches up when the user returns

On sign-out it cancels TanStack queries before navigating. Login still shows the existing “Session expired” notice for `session_missing`.

Still **not** a global user store — ADR 0001 stands; identity remains `getUser()` at server/proxy boundaries.

**Plan:** [app/development/changelogs/auth-session-expiry/0-session-expiry-plan.md](../app/development/changelogs/auth-session-expiry/0-session-expiry-plan.md)

### Reflections

- **Proxy/layout alone are not enough for SPA tabs.** Document navigations already redirected guests; an open tab that never remounts kept refetching `/api/*` with a dead refresh token (401 storm + React #418).
- **Two opposite islands conflicted.** Separate “expiry → login” and “restored → app” listeners (including navigating on `INITIAL_SESSION`) bounced after cross-tab sign-out: land on login, then get pushed back into the app. Collapsed to **one rule** (URL must match session) and **one** root listener.
- **Ignore `INITIAL_SESSION` for navigation.** First paint belongs to proxy/layout; reacting to seed events caused the bounce.
- **Background tabs don’t get reliable live events.** Browsers throttle background JS; Supabase often surfaces auth recovery on focus. Instant redirect while another tab is still in the background is not a realistic goal. **Reconcile on tab return** (visibility/focus + `getSession`) is the correct product bar; reconcile is a no-op when already consistent.
- **Hard `location.assign` + once-only lock** beats soft client routing for cookie/cache reset and avoids duplicate login redirects when focus and `SIGNED_OUT` fire together.
- **Do not sprinkle 401 redirects into every entity fetcher** for v1 — centralize in the sync island (optional QueryClient/`apiFetch` safety net later if needed).
