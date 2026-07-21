# App lock

App lock is a **second gate** after Supabase login. Signing in proves who you are; app lock asks for a separate password before the protected app UI is shown.

It is **not** the account (Auth) password. Changing or forgetting the app lock password does not affect Supabase Auth.

Related:

- [ADR 0016 — App lock session cookie](../adr/0016-app-lock-session-cookie.md) — decision record
- [User session and preferences](./user-session-and-preferences.md) — session vs prefs; no UserContext
- [Security guide](../guides/security.md) — gates, RLS; hash never in client read models
- [ADR 0001 — Auth architecture](../adr/0001-auth-architecture.md) — Auth remains identity source of truth
- Profile settings UI: `features/profile/app-lock-section/`

---

## Mental model (two layers)

| Layer | What it answers | Where it lives |
| --- | --- | --- |
| Auth session | “Who is signed in?” | Supabase cookies |
| App lock | “Is this browser session allowed to see the app right now?” | DB flag + hash + unlock cookie |

```text
Login (Supabase)
    → user is authenticated
    → if app_lock_enabled and no unlock cookie
        → AppLockGate (password screen)
    → else
        → AppShell + pages
```

Logout always clears the unlock cookie, so the next login must unlock again if lock is enabled.

---

## What is stored

Table: `mf_user_security_settings` (migration `supabase/migrations/009_profile.sql`)

| Column | Meaning |
| --- | --- |
| `app_lock_enabled` | On/off switch |
| `app_password_hash` | `scrypt$<salt>$<hash>` — **never** plaintext |

Client read model (`ProfileSecurity`) only exposes `appLockEnabled`. The hash stays on the server.

Hash helpers: `entities/profile/lib/hash-app-password.ts` (`hashAppPassword` / `verifyAppPassword`).

---

## Unlock session cookie

Cookie name: `mf_app_lock_unlocked`

| Property | Value |
| --- | --- |
| Value | authenticated user id (must match current user) |
| Flags | `httpOnly`, `sameSite: lax`, `secure` in production |
| Cleared on | logout, or when lock is disabled |

Helpers: `features/app-lock/model/app-lock-session-cookie.ts`

- `setAppLockUnlocked(userId)` — mark this browser session unlocked
- `isAppLockUnlocked(userId)` — cookie present and equals `userId`
- `clearAppLockUnlocked()` — drop the cookie

If another user’s id were somehow in the cookie, it would not match → still locked.

---

## Where it mounts

`app/(app)/layout.tsx` (protected routes only):

1. Resolve Supabase user (redirect to login if missing).
2. Load `getSecurityRow(user.id)` and `isAppLockUnlocked(user.id)` in parallel.
3. Wrap the shell in `AppLockGate` around `AppShell`.

`AppLockGate` (`features/app-lock/ui/app-lock-gate.tsx`):

- If lock is **off**, or unlock cookie matched → render children.
- If lock is **on** and not unlocked → full-screen password form; children stay hidden.

After a successful unlock POST, the gate sets local `unlocked` to `true` so the UI opens without a full reload.

---

## Configure on Profile (enable / change / disable)

UI: `features/profile/app-lock-section/`  
Hook → `PATCH /api/profile/security`  
Server use-case: `entities/profile/mutations/update-app-lock.ts`

| Action | Body (conceptually) | What happens |
| --- | --- | --- |
| `enable` | new password (+ confirm in UI) | Hash stored, `app_lock_enabled = true`, unlock cookie set so you are not locked out immediately |
| `change` | current + new password | Verify current, replace hash, keep unlocked |
| `disable` | current password | Verify, clear hash, `app_lock_enabled = false`, clear unlock cookie |

Min password length in the UI: **4** characters.

Cookie wiring on the PATCH route: unlock on enable/change; clear on disable (`app/api/profile/security/route.ts`).

---

## Unlock flow (when the gate shows)

```text
User types password
  → POST /api/profile/security/unlock  { password }
  → verifyAndUnlockAppLock(userId, password)
      → load security row
      → verifyAppPassword against hash
      → setAppLockUnlocked(userId)
  → AppLockGate shows AppShell
```

| Path | Role |
| --- | --- |
| `features/app-lock/client/unlock-app-lock.ts` | browser `fetch` |
| `app/api/profile/security/unlock/route.ts` | GET status / POST unlock |
| `features/app-lock/model/verify-app-lock.ts` | verify + set cookie |

Wrong password → `403` / inline error. Correct password → unlock cookie set; gate opens.

---

## Logout

`features/auth/logout/model/logout-action.ts` always calls `clearAppLockUnlocked()` after `signOut()`, even if sign-out fails, so a later session cannot reuse an old unlock flag.

---

## File map

| Responsibility | Path |
| --- | --- |
| Settings UI on Profile | `features/profile/app-lock-section/` |
| Full-screen gate | `features/app-lock/ui/app-lock-gate.tsx` |
| Unlock cookie | `features/app-lock/model/app-lock-session-cookie.ts` |
| Verify + unlock | `features/app-lock/model/verify-app-lock.ts` |
| Hash / verify | `entities/profile/lib/hash-app-password.ts` |
| Enable / change / disable | `entities/profile/mutations/update-app-lock.ts` |
| PATCH settings API | `app/api/profile/security/route.ts` |
| Unlock API | `app/api/profile/security/unlock/route.ts` |
| Mount gate | `app/(app)/layout.tsx` |
| Clear on logout | `features/auth/logout/model/logout-action.ts` |

Client-safe barrel: `features/app-lock/index.ts`  
Server-only helpers: `features/app-lock/server.ts`

---

## What app lock does *not* do

- It does not replace Supabase Auth or RLS. APIs still require a signed-in user.
- It does not encrypt notes/tasks at rest. It only hides the protected UI until the session is unlocked.
- It is per browser session (cookie), not a global “logged in elsewhere is locked” device manager.

---

## Manual check

1. Profile → enable app lock with a password.
2. Soft refresh / navigate — stay unlocked (cookie still set).
3. Log out → log in again → lock screen appears.
4. Wrong password → error; correct password → app opens.
5. Profile → disable with current password → gate no longer appears.
