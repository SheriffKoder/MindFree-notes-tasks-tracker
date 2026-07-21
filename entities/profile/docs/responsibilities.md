# Profile entity — where to look

File map by responsibility. Paths are relative to `entities/profile/` unless
noted. For the *why*, see [README.md](./README.md), [domain-model.md](./domain-model.md),
and [seeding.md](./seeding.md).

---

## Entry points

| Import | Use |
| --- | --- |
| `@/entities/profile` (`index.ts`) | Domain types + pure helpers (any layer) |
| `@/entities/profile/server` (`server.ts`) | Queries, mutations, hydration, repository helpers (RSC / API only) |
| `@/entities/profile/client` (`client.ts`) | TanStack keys, fetchers, hooks (`"use client"` only) |

Do not import `server.ts` from client components. Do not deep-import
repository files from features — use the barrels.

---

## Domain model

`model/types.ts` — `Profile`, `UserPreferences`, `UserSecuritySettings`, `*Row`,
`ThemeMode`, `TextContrastMode`  
`model/read-models.ts` — `ProfileAccount`, `ProfilePreferences`, `ProfileSecurity`,
`ProfilePageData` (no hash)  
`model/preferences-patch.ts` — partial preference update type  
`model/export.ts` — `ProfileExportResult` (xlsx download payload)

---

## Validation (`schema/`)

`schema/css-color.ts` — `nullableCssColorSchema`  
`schema/update-profile.schema.ts` — PATCH account (`displayName`)  
`schema/update-preferences.schema.ts` — PATCH preferences (partial + at least one field)  
`schema/update-app-lock.schema.ts` — PATCH security (`enable` / `change` / `disable`)  
`schema/index.ts` — barrel

---

## Pure helpers (`lib/`)

`lib/default-profile-values.ts` — `createDefaultProfileRows`, default theme constants  
`lib/map-row.ts` — row ↔ domain ↔ read-model slices  
`lib/hash-app-password.ts` — scrypt hash / verify (server)  
`lib/build-export-workbook.ts` — Notes / Tasks / Reminders / Records sheets → `.xlsx`  
`lib/to-csv.ts` — CSV helpers (legacy / tests; export path uses workbook)

---

## Repository

`repository/get-authenticated-user-id.ts` — `getAuthenticatedUserId`, `getAuthenticatedUser`  
`repository/get-profile-row.ts` / `get-preferences-row.ts` / `get-security-row.ts`  
`repository/update-profile-row.ts` / `update-preferences-row.ts` / `update-security-row.ts`  
`repository/ensure-profile-exists.ts` — lazy seed (C)  
`repository/index.ts` — barrel

---

## Queries (server read use-cases)

`queries/get-profile-page-data.ts` — ensure + assemble `ProfilePageData`  
`queries/build-profile-export.ts` — gather notes/activities → workbook result  
`queries/index.ts` — barrel

---

## Mutations (server write use-cases)

`mutations/update-profile.ts` — display name  
`mutations/update-preferences.ts` — theme / export fields  
`mutations/update-app-lock.ts` — enable / change / disable (hash in this module only)  
`mutations/index.ts` — barrel

---

## Hydration

`hydration/seed-profile-page-cache.ts` — write `ProfilePageData` into a `QueryClient`  
`hydration/index.ts` — barrel  

Used from `features/profile/apply-theme` layout seed (app-wide), not only `/profile`.

---

## Client (`client/` + `hooks/`)

`client/query-keys.ts` — `profilePageQueryKey`  
`client/profile-page-query.ts` — GET fetcher + query options  
`client/patch-account.ts` / `patch-preferences.ts` / `patch-security.ts`  
`client/post-export.ts` — POST export  
`hooks/use-profile-page-query.ts`  
`hooks/use-update-profile-mutation.ts`  
`hooks/use-update-preferences-mutation.ts`  
`hooks/use-update-app-lock-mutation.ts`

---

## API routes (outside entity)

Thin handlers under `app/api/profile/`:

| Route | Role |
| --- | --- |
| `GET /api/profile` | `getProfilePageData` |
| `PATCH /api/profile/account` | `updateProfile` |
| `PATCH /api/profile/preferences` | `updatePreferences` |
| `PATCH /api/profile/security` | `updateAppLock` + unlock cookie |
| `GET\|POST /api/profile/security/unlock` | unlock session |
| `POST /api/profile/export` | `buildProfileExport` |

---

## Features that consume this entity

| Feature | Role |
| --- | --- |
| `features/profile/account-section/` | Display name form |
| `features/profile/theme-section/` | Theme / accent / custom fields |
| `features/profile/app-lock-section/` | Enable / change / disable UI |
| `features/profile/export-section/` | Export email + download |
| `features/profile/apply-theme/` | App-wide theme apply + boot |
| `features/app-lock/` | Gate + unlock cookie |

View composition: `views/profile/`.
