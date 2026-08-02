# Changelog

Product and architecture notes for shipped behavior changes. Newest first.

Build-history plans may still live under `app/development/changelogs/`; this file is the durable **WHAT / WHY** record for the docs tree.

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
