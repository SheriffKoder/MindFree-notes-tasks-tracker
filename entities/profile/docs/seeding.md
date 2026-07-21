# Profile seeding (C + A)

Every authenticated user should have exactly one row in each of the three
profile tables. MindFree uses **both**:

| Path | Letter | When it runs |
| --- | --- | --- |
| DB trigger on `auth.users` insert | **A** | New signup (email or OAuth) |
| Lazy get-or-create in app code | **C** | First profile read (`getProfilePageData`) |

Neither login nor signup **server actions** insert profile rows themselves.

---

## Why both?

- **A** covers the happy path so rows exist immediately after signup.
- **C** covers existing users created before the migration, failed/partial
  triggers, and any race — first Profile (or layout theme seed) still works.

They must be **idempotent** together: running C after A (or twice) must not
overwrite user-edited preferences.

---

## A — Signup trigger

Defined in `supabase/migrations/006_profile.sql`:

- Function `mf_handle_new_user` runs **after insert** on `auth.users`.
- Inserts into `mf_profiles`, `mf_user_preferences`, `mf_user_security_settings`
  with the same defaults as `createDefaultProfileRows`.
- Migration also **backfills** existing `auth.users` with `INSERT … ON CONFLICT DO NOTHING`.

Defaults must stay aligned with
`entities/profile/lib/default-profile-values.ts`.

---

## C — Lazy `ensureProfileExists`

```ts
// entities/profile/repository/ensure-profile-exists.ts
await ensureProfileExists(userId, email);
```

Called at the start of `getProfilePageData` (SSR hydrate + `GET /api/profile`).

Behavior:

1. Build defaults via `createDefaultProfileRows(userId, email)`.
2. Upsert all three tables in parallel with `onConflict` + **`ignoreDuplicates: true`**
   (Postgres `ON CONFLICT DO NOTHING` style).
3. Throw if any upsert errors for a reason other than “already there”.

Because duplicates are ignored, existing `theme_mode`, accent, display name,
etc. are **never** reset by a later ensure call.

---

## Call chain

```text
(app)/layout ProfilePreferencesHydrationSeed
  or GET /api/profile
    → getProfilePageData(userId, authEmail)
        → ensureProfileExists(userId, authEmail)   // C
        → getProfileRow / getPreferencesRow / getSecurityRow
        → ProfilePageData
```

If a row is still missing after ensure, `getProfilePageData` throws — that
indicates a real failure, not “first visit”.

---

## Idempotency checklist

- [ ] Trigger insert uses conflict-safe inserts (or equivalent) for re-runs / backfill
- [ ] `ensureProfileExists` uses `ignoreDuplicates: true`
- [ ] Defaults live in one TS helper + SQL comments pointing at each other
- [ ] Auth paths do not double-seed with different defaults

Unit coverage: `repository/ensure-profile-exists.test.ts`,
`queries/get-profile-page-data.test.ts`.

---

## Related

- [domain-model.md](./domain-model.md) — table shapes and defaults table
- [user-session-and-preferences.md](../../../docs/architecture/user-session-and-preferences.md)
