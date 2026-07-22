# User session and preferences

How MindFree resolves who is signed in, and how profile preferences (especially theme) reach the rest of the app.

There is **no React user object** passed around. The app uses the **Supabase Auth session** for identity, and **profile entity rows** for settings. Those settings apply app-wide — not only on `/profile`.

Related:

- [ADR 0001 — Auth architecture](../adr/0001-auth-architecture.md) — Supabase Auth as identity source of truth
- [App lock](./app-lock.md) — second gate after login (session cookie + hash)
- [Security guide](../guides/security.md) — gates, RLS, IDOR, demo Profile gate
- Profile domain: [`entities/profile/docs/`](../../entities/profile/docs/)
- Theme applier: [`features/profile/apply-theme/README.md`](../../features/profile/apply-theme/README.md)
- Profile page: [`views/profile/docs/`](../../views/profile/docs/)

---

## Mental model

| Concern | Where it lives | How code reads it |
| --- | --- | --- |
| Who is signed in | Supabase Auth session in **HTTP cookies** | `supabase.auth.getUser()` |
| App-owned profile data | `mf_profiles`, `mf_user_preferences`, `mf_user_security_settings` | `entities/profile` queries / mutations |
| Theme / accent | DB prefs → TanStack cache → applier + optional localStorage boot | `ProfileThemeApplier`, `ThemeBootScriptTag` |
| App lock unlock | HttpOnly cookie `mf_app_lock_unlocked` | `isAppLockUnlocked(userId)` |

Auth identity and preferences are different layers: the session answers “who?”, preferences answer “what settings for that who?”, and those settings paint the **whole protected shell**.

---

## Auth session (how the user is called)

### Storage

After login, signup confirm, or OAuth callback, `@supabase/ssr` persists the session in cookies.

- Server: `shared/lib/supabase/server.ts` — per-request client wired to `cookies()`
- Browser: `shared/lib/supabase/client.ts` — browser client
- Refresh / redirects: `proxy.ts` (session updater + demo Profile gate)

### Resolve on the server

```ts
const supabase = await createClient(); // from shared/lib/supabase/server
const {
  data: { user },
} = await supabase.auth.getUser();
```

Helpers:

| Helper | Path | Behavior |
| --- | --- | --- |
| `getAuthenticatedUserId()` | `entities/*/repository/get-authenticated-user-id.ts` | returns `user.id` or throws `"Unauthorized"` |
| `requireAuthenticatedUserId()` | `shared/lib/auth/require-authenticated-user.ts` | returns `user.id` or `null` (API routes) |
| `isDemoUserEmail(email)` | `shared/lib/auth/demo-login-config.ts` | matches `DEMO_LOGIN_EMAIL` |

Typical page / hydration seed:

```ts
const userId = await getAuthenticatedUserId();
await getSomePageData(userId);
```

### Protected layout does not pass user down

`app/(app)/layout.tsx` gates the tree and mounts app-wide profile concerns:

1. `getUser()` → redirect to `/login` if missing
2. App lock status + `AppLockGate`
3. `ProfilePreferencesHydrationSeed` + `ProfileThemeApplier`
4. `AppShell` with `showProfileNav` (hidden for demo email)

It does **not** inject `user` into React context. Child server code resolves the session again when it needs an id or email.

### Resolve on the client

```ts
const supabase = createClient(); // from shared/lib/supabase/client
const { data } = await supabase.auth.getUser();
const userId = data.user?.id ?? null;
```

Thin helper used by offline sync: `useAuthUserId()` in `shared/offline-queue/hooks/use-offline-sync.ts`. Domain data still goes through TanStack Query, not a global user store.

### Profile-specific reads

- Prefer `getAuthenticatedUserId()` for repository/query scoping (same as notes/activity).
- When seeding or showing email, also read `user.email` from `getUser()` on the server.
- Do not add a `UserProvider` unless there is an explicit product reason.

---

## Preferences (how settings reach the app)

Preferences are **entity data** scoped by `auth.users.id` — same pattern as notes: DB → server query → TanStack hydrate → client apply.

```text
Profile UI (theme / export / …)
  → PATCH /api/profile/preferences (etc.)
  → entity mutation
  → mf_user_preferences (or profiles / security)

On any protected load:
  ProfilePreferencesHydrationSeed in (app)/layout
    → getProfilePageData(userId, authEmail)
    → ensureProfileExists (lazy seed if rows missing)
    → seed TanStack profile page cache
  → ProfileThemeApplier (client)
       → next-themes setTheme(light|dark)   // custom uses text_contrast_mode
       → CSS vars + .theme-custom
       → write localStorage snapshot (FOUC prevention)
```

| Piece | Role |
| --- | --- |
| `mf_user_preferences` | Durable store; RLS `user_id = auth.uid()` |
| `getProfilePageData` | Assembles account + preferences + security (**no** password hash) |
| PATCH preference routes | Validated writes (`isCssColor` for colors) |
| `ProfileThemeApplier` | Bridge prefs → `next-themes` + `.theme-custom` |
| `ThemeBootScriptTag` | Blocking `<head>` script: apply snapshot before paint |
| `shared/color-picker` | UI for accent / background / drawer colors |
| TanStack Query | Cache for Profile UI + theme applier; not a replacement for the auth session |

### Theme mapping

- **`accent_color`** → `--custom-accent` (+ accent-fg). Applies in **light, dark, and custom**. `null` = mode palette default.
- **Custom mode only:** `background_color` → `--custom-bg`; `background_image_url` → body background (after mount); `drawer_background_*` → `--custom-drawer-bg`; `text_contrast_mode` → next-themes base under custom.
- Hook in `app/globals.css` (`.theme-custom`). Unset `--custom-*` vars fall through to light/dark tokens.

### FOUC prevention (localStorage boot)

1. After prefs load/edit, `ProfileThemeApplier` writes `mindfree-profile-theme` and syncs next-themes key `theme`.
2. Root layout renders `ThemeBootScriptTag` in `<head>` so the first paint uses the snapshot (html class + CSS vars). Body background image waits for the React applier (body may not exist in `<head>`).

### Signup seeding (C + A)

DB trigger on `auth.users` insert **and** lazy `ensureProfileExists` on first profile read. Auth login/signup actions do not seed rows themselves. Details: [entities/profile/docs/seeding.md](../../entities/profile/docs/seeding.md).

### Demo account

If the signed-in email matches `DEMO_LOGIN_EMAIL`:

- Profile nav hidden; `/profile` redirects home (page + `proxy.ts`)
- Non-GET `/api/profile/*` → 403
- GET `/api/profile` stays allowed so theme can still hydrate
- Month-scoped pages default to `DEMO_DEFAULT_MONTH` when `?month=` is missing —
  see [demo-default-month.md](./demo-default-month.md)

---

## Quick checklist

When you need “the user”:

1. Server work → `getAuthenticatedUserId()` / `requireAuthenticatedUserId()` / `getUser()` for email.
2. Client one-off → `createClient().auth.getUser()` or `useAuthUserId()`.
3. Do not look for a React user context — it does not exist by design.

When you need “their settings”:

1. Read/write through `entities/profile` APIs (`mf_user_preferences`, etc.).
2. Apply theme via `ProfileThemeApplier` / boot script — do not reintroduce a second ad-hoc theme store.
3. Keep `next-themes` as the light/dark class mechanism; durable mode comes from the DB.
4. Accent overrides the default light/dark accent when set; clear it to restore the palette.
