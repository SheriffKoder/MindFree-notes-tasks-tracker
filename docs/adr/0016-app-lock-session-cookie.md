## ADR 0016: App lock via session cookie and scrypt hash

### Status

Accepted

### Context

Profile needs an optional **app lock**: after Supabase Auth sign-in, the user
can require a second password before the protected UI appears. Constraints:

- Must not replace or couple to the Auth account password.
- Plaintext must never be stored or returned to the client.
- Unlock should last for the current browser session without re-prompting on
  every navigation, but must clear on logout.
- APIs and RLS still require a signed-in Auth user — lock is a UI / session
  gate, not encryption of user data.

### Decision

1. **Store** lock state in `mf_user_security_settings`:
   - `app_lock_enabled` boolean
   - `app_password_hash` as `scrypt$<saltHex>$<hashHex>` via Node `crypto.scrypt`
     (`entities/profile/lib/hash-app-password.ts`)
2. **Never** put the hash in client read models (`ProfileSecurity` exposes only
   `appLockEnabled`).
3. **Unlock** by verifying the candidate password server-side, then setting an
   HttpOnly cookie `mf_app_lock_unlocked` whose value is the authenticated
   `user.id` (`features/app-lock/model/app-lock-session-cookie.ts`).
4. **Gate** protected UI in `app/(app)/layout.tsx` with `AppLockGate`: if lock is
   enabled and the cookie does not match `user.id`, show the unlock form and
   hide `AppShell`.
5. **Clear** the cookie on logout and when lock is disabled. Setting / changing
   the lock password also sets the unlock cookie so the user is not locked out
   immediately after enabling.

Enable / change / disable go through `PATCH /api/profile/security`. Unlock goes
through `POST /api/profile/security/unlock`.

### Why

- Separates **identity** (Auth session) from **local privacy gate** (app lock)
  without a second Auth factor or MFA product scope.
- scrypt + salt is a standard password-hashing approach available in Node
  without extra dependencies; `timingSafeEqual` on verify.
- An HttpOnly unlock cookie keeps the “session unlocked” flag off
  `localStorage` / client JS while still surviving soft navigations.
- Binding the cookie value to `user.id` avoids treating a stale unlock flag as
  valid after account switch on the same browser.

Rejected:

- **Reuse Auth password** — couples lock to account recovery; wrong security
  boundary; would require re-auth APIs we do not want for every soft refresh.
- **Encrypt notes at rest with the lock password** — out of scope; needs key
  management and breaks shared-device expectations for V1.
- **JWT / signed unlock token in localStorage** — readable by XSS; cookie
  HttpOnly is stricter for this flag.
- **Server session table for unlock** — heavier than a cookie for a per-browser
  UI gate; cookie cleared on logout is enough for V1.

### Consequences

Positive:

- Clear mental model: Auth answers “who?”, cookie answers “unlocked for this
  browser session?”
- Hash never crosses the client boundary.
- Logout always forces re-unlock on next login when lock is enabled.

Trade-offs:

- Lock does **not** encrypt data or protect APIs by itself — a crafted client
  with a valid Auth session can still call APIs unless additional checks are
  added later.
- Cookie is per browser profile, not a multi-device “lock everywhere” manager.
- Forgetting the app lock password requires disable-with-current or a future
  recovery path (not in V1).

### Follow-up

- How-to: [architecture/app-lock.md](../architecture/app-lock.md)
- Session context: [architecture/user-session-and-preferences.md](../architecture/user-session-and-preferences.md)
- Security notes: [guides/security.md](../guides/security.md)
- Auth identity ADR: [0001-auth-architecture.md](./0001-auth-architecture.md)
