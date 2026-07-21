# Security

How MindFree keeps guests out of the app and keeps User A from reading User B’s data.

**Auth decision:** [ADR 0001](../adr/0001-auth-architecture.md)  
**Deep dive / history:** `app/development/workflow/auth/security.md`  
**Entity auth pattern:** `shared/lib/auth/README.md`

---

## Verdict

Safe for Notes with **defense in depth**:

1. Session gates (`proxy.ts` + `(app)` layout)
2. API `requireAuthenticatedUserId()`
3. Repository `.eq("user_id", userId)` on every query
4. Supabase **RLS** — mandatory; app filters are not a substitute

RLS must be applied in every environment (see migrations under `supabase/migrations/`).

---

## Defense layers

```text
Request
  ├─ proxy.ts                 pages → /login; /api/* → JSON 401;
  │                           demo user: /profile → /; non-GET /api/profile → 403
  ├─ app/(app)/layout.tsx     second session check + app lock + theme seed
  ├─ API handlers             requireAuthenticatedUserId() → pass userId
  └─ repository + RLS         user_id scope + auth.uid() = user_id
```

---

## Route protection

| Layer | Behavior |
| ----- | -------- |
| `proxy.ts` | Refresh session; redirect guests; JSON 401 for unauthenticated `/api/*`; demo Profile gate |
| `(app)` layout | Redirect if session missing when the layout resolves |
| Public | `/login`, `/signup`, `/auth/callback`, `/auth/confirm` |

---

## API + IDOR

Note APIs never trust a bare id alone. Handlers pass the authenticated `userId` into use-cases → repository:

```ts
.eq("id", id).eq("user_id", userId)
```

Guessing another user’s note UUID returns the same **404** as a missing row (no existence leak). There is no “list all users” API.

---

## Client Supabase access

Browser and server clients use the **publishable/anon** key with the user session — not a service-role key that bypasses RLS. Even a crafted client request only sees rows allowed by RLS.

Realtime subscriptions filter by `user_id` and still respect RLS ([realtime](../../entities/note/docs/realtime.md)).

---

## Profile / app lock

- **App lock ≠ Auth password.** Lock uses `mf_user_security_settings.app_password_hash` (scrypt) and an HttpOnly unlock cookie. See [app-lock.md](../architecture/app-lock.md).
- **Client read models never include the hash** — `ProfileSecurity` exposes only `appLockEnabled`.
- **Demo Profile gate:** when the signed-in email matches `DEMO_LOGIN_EMAIL`, `proxy.ts` redirects `/profile` home and returns 403 on non-GET `/api/profile/*` (GET stays allowed for theme). Details: [shared/lib/auth/README.md](../../shared/lib/auth/README.md).

## Ops checklist

- Apply migrations so RLS policies exist in production (include `009_profile.sql`)
- Keep confirm/callback URLs and email templates aligned ([setup](../setup/1-supabase-auth-dashboard-setup.md))
- Never ship a service-role key to the client
- Gate demo login behind env flags if used
- Confirm demo users cannot open Profile or mutate profile APIs

---

## Related

| Doc | Why |
| --- | --- |
| [routing.md](../architecture/routing.md) | Where gates sit in the route tree |
| [data-flow.md](../architecture/data-flow.md) | userId through use-cases |
| [user-session-and-preferences.md](../architecture/user-session-and-preferences.md) | Session vs prefs; demo gate |
| [app-lock.md](../architecture/app-lock.md) | Unlock cookie + gate |
| [ADR 0001](../adr/0001-auth-architecture.md) | Why Supabase Auth |
