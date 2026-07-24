# Changelog

Product and architecture notes for shipped behavior changes. Newest first.

Build-history plans may still live under `app/development/changelogs/`; this file is the durable **WHAT / WHY** record for the docs tree.

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
