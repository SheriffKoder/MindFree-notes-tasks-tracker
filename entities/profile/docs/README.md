# Profile entity docs

**WHY** documentation for the Profile domain (account, preferences, security,
export). For file lookup, use [`./responsibilities.md`](./responsibilities.md).
Entry points: `@/entities/profile`, `@/entities/profile/server`,
`@/entities/profile/client`.

Profile is **app data keyed by Auth**, not a second identity system. There is no
React user store — see
[user session and preferences](../../../docs/architecture/user-session-and-preferences.md).

| Doc | Topic |
| --- | ----- |
| [domain-model.md](./domain-model.md) | Three tables, read models (no hash), defaults, RLS |
| [seeding.md](./seeding.md) | Signup trigger + lazy `ensureProfileExists` (C + A) |
| [responsibilities.md](./responsibilities.md) | File map: server / client / repository / queries / … |

**Related (outside this folder):**

- [App lock](../../../docs/architecture/app-lock.md) — unlock cookie + gate
- Theme apply: [`features/profile/apply-theme/README.md`](../../../features/profile/apply-theme/README.md)
- Page composition: [`views/profile/docs/`](../../../views/profile/docs/)
- Migration: `supabase/migrations/006_profile.sql`

## Reading order

1. [domain-model.md](./domain-model.md) — what is stored and what the client sees  
2. [seeding.md](./seeding.md) — how rows appear for new and existing users  
3. [responsibilities.md](./responsibilities.md) — where to change code  
4. Session/theme context: [user-session-and-preferences.md](../../../docs/architecture/user-session-and-preferences.md)
