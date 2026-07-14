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
  ├─ proxy.ts                 pages → /login; /api/* → JSON 401
  ├─ app/(app)/layout.tsx     second session check
  ├─ API handlers             requireAuthenticatedUserId() → pass userId
  └─ repository + RLS         user_id scope + auth.uid() = user_id
```

---

## Route protection

| Layer | Behavior |
| ----- | -------- |
| `proxy.ts` | Refresh session; redirect guests from protected pages; JSON 401 for unauthenticated `/api/*` |
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

## Ops checklist

- Apply migrations so RLS policies exist in production
- Keep confirm/callback URLs and email templates aligned ([setup](../setup/1-supabase-auth-dashboard-setup.md))
- Never ship a service-role key to the client
- Gate demo login behind env flags if used

---

## Related

| Doc | Why |
| --- | --- |
| [routing.md](../architecture/routing.md) | Where gates sit in the route tree |
| [data-flow.md](../architecture/data-flow.md) | userId through use-cases |
| [ADR 0001](../adr/0001-auth-architecture.md) | Why Supabase Auth |
