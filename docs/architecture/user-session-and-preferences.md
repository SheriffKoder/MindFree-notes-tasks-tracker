# User session and preferences

How MindFree resolves the signed-in user and (once Profile ships) how preferences reach the rest of the app.

Related:

- [ADR 0001 — Auth architecture](../adr/0001-auth-architecture.md) — Supabase Auth as source of truth
- [Profile page plan](../../app/development/workflow/profile/0-profile-page-plan.md) — tables, APIs, theme applier steps
- [Security guide](../guides/security.md) — gates, RLS, IDOR

---

## Mental model

There is **no React `UserContext` / `AuthProvider`**.

| Concern | Where it lives | How code reads it |
| --- | --- | --- |
| Who is signed in | Supabase Auth session in **HTTP cookies** | `supabase.auth.getUser()` |
| App-owned profile data | DB rows keyed by `auth.users.id` | entity queries / mutations (planned) |
| Theme today | `next-themes` (browser) | `useTheme()` / `ThemeProvider` |
| Preferences later | `mf_user_preferences` + TanStack cache | Profile read model + theme applier |

Auth identity and preferences are different layers: the session answers “who?”, preferences answer “what settings for that who?”.

---

## Auth session (how the user is called)

### Storage

After login, signup confirm, or OAuth callback, `@supabase/ssr` persists the session in cookies.

- Server: `shared/lib/supabase/server.ts` — per-request client wired to `cookies()`
- Browser: `shared/lib/supabase/client.ts` — browser client
- Refresh / redirects: `proxy.ts` (session updater)

### Resolve on the server

```ts
const supabase = await createClient(); // from shared/lib/supabase/server
const {
  data: { user },
} = await supabase.auth.getUser();
```

Helpers already used by notes/activity:

| Helper | Path | Behavior |
| --- | --- | --- |
| `getAuthenticatedUserId()` | `entities/*/repository/get-authenticated-user-id.ts` | returns `user.id` or throws `"Unauthorized"` |
| `requireAuthenticatedUserId()` | `shared/lib/auth/require-authenticated-user.ts` | returns `user.id` or `null` (API routes) |

Typical page / hydration seed:

```ts
const userId = await getAuthenticatedUserId();
await getSomePageData(userId);
```

### Protected layout does not pass user down

`app/(app)/layout.tsx` only gates the tree:

1. `getUser()`
2. redirect to `/login` if missing
3. render `AppShell` + children

It does **not** inject `user` into React context or props. Child server code resolves the session again when it needs an id (or email).

### Resolve on the client

```ts
const supabase = createClient(); // from shared/lib/supabase/client
const { data } = await supabase.auth.getUser();
const userId = data.user?.id ?? null;
```

Thin helper used by offline sync: `useAuthUserId()` in `shared/offline-queue/hooks/use-offline-sync.ts` (one-shot `useEffect` + local state). Domain data still goes through TanStack Query, not a global user store.

### What to use for Profile

- Prefer `getAuthenticatedUserId()` for repository/query scoping (same as notes/activity).
- When seeding profile rows or showing email, also read `user.email` from `getUser()` on the server.
- Do not add a `UserProvider` unless there is an explicit product reason; the app intentionally re-resolves auth from the session.

---

## Preferences (how settings reach the app)

### Today (before Profile preferences)

Theme is **local only**:

```text
ThemeSwitcher → next-themes setTheme() → class on <html> (+ browser persistence)
```

- Mounted via `ThemeProvider` in `app/layout.tsx` (`defaultTheme="system"`, `enableSystem`).
- UI: `components/theme-switcher.tsx` on Home.
- Nothing is written to Supabase. Clearing storage or another device does not share the choice.

### Planned (Profile Steps 5 / 8 / 9)

Preferences become **entity data** scoped by the auth user id — same shape as notes: DB → server query → optional TanStack hydrate → client apply.

```text
Profile UI (theme / export)
  → PATCH /api/profile/preferences
  → updatePreferences mutation
  → mf_user_preferences
       (theme_mode, accent_color [all modes],
        background_color, background_image_url,
        drawer_background_color, drawer_background_opacity,
        text_contrast_mode, export_email)

On load / after edit:
  getProfilePageData(userId, authEmail)
    → ensureProfileExists (lazy seed)
    → parallel row reads
    → ProfilePageData
  → TanStack cache (hydration seed on /profile; applier may read cache or a light fetch)
  → ProfileThemeApplier (client, authenticated shell)
       → next-themes setTheme('light' | 'dark')  // custom uses text_contrast_mode
       → .theme-custom when accent or custom surface vars apply
       → accent always via --custom-accent when set
```

| Piece | Role |
| --- | --- |
| `mf_user_preferences` | Durable store; RLS `user_id = auth.uid()` |
| `getProfilePageData` | Server assembly of account + preferences + security (no password hash) |
| PATCH preferences route | Validated writes from Profile forms (`isCssColor` for colors) |
| `ProfileThemeApplier` | Bridge from saved prefs → `next-themes` + `globals.css` `.theme-custom` |
| `shared/color-picker` | UI for accent / background / drawer colors |
| TanStack Query | Cache for Profile UI; not a replacement for the auth session |

Theme mapping:

- **`accent_color`** → `--custom-accent` (+ accent-fg). Applies in **light, dark, and custom**. `null` = mode palette default.
- **Custom mode only:** `background_color` → `--custom-bg`; `background_image_url` → body/wrapper image; `drawer_background_*` → `--custom-drawer-bg`; `text_contrast_mode` → next-themes base under custom.
- Hook already in `app/globals.css` (`.theme-custom`). Unset `--custom-*` vars fall through to light/dark tokens.

Signup seeding (C + A): DB trigger on `auth.users` insert **and** lazy `ensureProfileExists` on first profile read. Auth paths do not call seeding themselves.

---

## Quick checklist

When you need “the user”:

1. Server work → `getAuthenticatedUserId()` / `requireAuthenticatedUserId()` / `getUser()` for email.
2. Client one-off → `createClient().auth.getUser()` or `useAuthUserId()`.
3. Do not look for a React user context — it does not exist by design.

When you need “their settings” (after Profile ships):

1. Read/write `mf_user_preferences` through profile entity APIs.
2. Apply theme globally via the profile theme applier, not by reintroducing a second ad-hoc theme store.
3. Keep `next-themes` as the light/dark class mechanism; persisted mode comes from the DB.
4. Accent overrides the default light/dark accent when set; clear it to restore the palette.
