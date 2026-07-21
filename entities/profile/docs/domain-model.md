# Profile domain model

Three tables, one auth user. Auth (`auth.users`) remains identity; these rows
hold display name, theme/export preferences, and app-lock settings.

Migration: `supabase/migrations/006_profile.sql`  
Defaults (TS mirror): `entities/profile/lib/default-profile-values.ts`  
Table constants: `shared/config/supabase-tables.ts`

---

## Tables

| Table | Key | Purpose |
| --- | --- | --- |
| `mf_profiles` | `id` = `auth.users.id` | Display name + email mirror |
| `mf_user_preferences` | `user_id` | Theme, custom surfaces, accent, export email |
| `mf_user_security_settings` | `user_id` | App lock flag + password **hash** |

All three: `ON DELETE CASCADE` from `auth.users`, `updated_at` triggers, RLS
enabled.

### `mf_profiles`

| Column | Notes |
| --- | --- |
| `display_name` | Editable on Profile; default `''` |
| `email` | Mirror of auth email at seed time; **auth email is authoritative** in the read model |

### `mf_user_preferences`

| Column | Notes |
| --- | --- |
| `theme_mode` | `light` \| `dark` \| `custom` (default `dark`) |
| `accent_color` | Nullable CSS color; applies in **all** modes; `NULL` = palette default |
| `background_*`, `drawer_*` | Custom mode surfaces |
| `text_contrast_mode` | `light` \| `dark` — next-themes base when mode is `custom` |
| `export_email` | Destination on file for export; default = auth email |

Colors are validated server-side (`isCssColor` / Zod) before write.

### `mf_user_security_settings`

| Column | Notes |
| --- | --- |
| `app_lock_enabled` | Default `false` |
| `app_password_hash` | `scrypt$…` only — **never plaintext**, never sent to the client |

App lock details: [docs/architecture/app-lock.md](../../../docs/architecture/app-lock.md).

---

## Domain vs row types

| Layer | File | Shape |
| --- | --- | --- |
| Domain | `model/types.ts` | camelCase `Profile`, `UserPreferences`, `UserSecuritySettings` |
| DB row | same file `*Row` | snake_case for Supabase |
| Mapping | `lib/map-row.ts` | row ↔ domain ↔ client slices |

---

## Client read models (no hash)

`model/read-models.ts` — what SSR / `GET /api/profile` / TanStack expose:

| Slice | Type | Contents |
| --- | --- | --- |
| Account | `ProfileAccount` | `displayName`, `email` (from **auth**, not only the mirror column) |
| Preferences | `ProfilePreferences` | theme + custom + accent + `exportEmail` |
| Security | `ProfileSecurity` | **`appLockEnabled` only** |
| Page | `ProfilePageData` | `{ account, preferences, security }` |

`UserSecuritySettings.appPasswordHash` exists on the server domain type for
verify/hash updates. It must not appear in `ProfilePageData` or any client
fetcher response.

Partial preference updates use `model/preferences-patch.ts` (`PreferencesPatch`).
Export download payload: `model/export.ts` (`ProfileExportResult` — multi-sheet
`.xlsx` as base64).

---

## Defaults

Keep SQL trigger and TypeScript in sync.

| Field | Default |
| --- | --- |
| `display_name` | `''` |
| `theme_mode` | `'dark'` |
| `text_contrast_mode` | `'dark'` |
| color / image fields | `null` |
| `export_email` | auth email at seed |
| `app_lock_enabled` | `false` |
| `app_password_hash` | `null` |

`createDefaultProfileRows(userId, email)` builds insert payloads for both the
lazy seeder and (conceptually) the trigger defaults.

---

## RLS ownership

Policies are own-row only (`id` / `user_id` = `auth.uid()`): select, insert,
update, delete on each table.

App code still scopes every repository call with the authenticated `userId`.
RLS is defense in depth, not a substitute for passing `userId` through
use-cases.

---

## Assembly

`getProfilePageData(userId, authEmail)`:

1. `ensureProfileExists` (see [seeding.md](./seeding.md))
2. Parallel row reads
3. Map to `ProfilePageData` (auth email into account slice)
