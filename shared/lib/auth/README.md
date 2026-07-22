# Auth pattern for entities

How to wire **tasks**, **progress**, and any new user-owned entity the same way as notes: edge guard → API auth → use-case → repository `user_id` filter → Supabase RLS.

Reference implementation: `entities/note/` + `app/api/notes/*`.

---

## Request flow

```text
Browser / fetch
  │
  ├─ proxy.ts                    pages → redirect /login; /api/* → JSON 401
  ├─ app/(app)/layout.tsx        second page guard (redirect)
  ├─ app/api/*/route.ts          requireAuthenticatedUserId() → 401
  ├─ entities/*/queries|mutations  use-case(userId, …)
  ├─ entities/*/repository       .eq("user_id", userId) on every query
  └─ Supabase table              RLS: auth.uid() = user_id
```

---

## 1. Database migration

Every user-owned table needs RLS before the API ships.

```sql
alter table public.mf_tasks enable row level security;

create policy "mf_tasks_select_own"
  on public.mf_tasks for select to authenticated
  using (auth.uid() = user_id);

-- repeat insert / update / delete with auth.uid() = user_id
```

- Column: `user_id uuid not null references auth.users(id)`
- Never use the service-role key in app runtime code.

---

## 2. Repository

- First parameter on every function: `userId: string`
- Every `select` / `update` / `delete`: `.eq("user_id", userId)` in addition to id/date filters
- Inserts: set `user_id: userId` from the caller (do not re-resolve auth inside the repository)
- Export one throwing guard for SSR paths: `getAuthenticatedUserId()` → throws `"Unauthorized"`

Example (notes):

```ts
export async function updateTaskById(
  userId: string,
  id: string,
  patch: UpdateTaskBody,
): Promise<Task | null> {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .update(dbPatch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  // ...
}
```

---

## 3. Use-cases (`queries/` + `mutations/`)

- Accept `userId` as the first argument
- Pass through to repository; no direct Supabase calls in use-cases
- Cross-user ID missing row → uniform **404** (same as non-existent id)

```ts
export async function getTasksResponse(userId: string): Promise<TasksResponse> {
  const tasks = await getTasksForUser(userId);
  return { tasks };
}
```

---

## 4. API routes (`app/api/<entity>/*/route.ts`)

Thin handlers only:

```ts
const userId = await requireAuthenticatedUserId();

if (!userId) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

const response = await getTasksResponse(userId);
return Response.json(response);
```

- `requireAuthenticatedUserId()` lives in `shared/lib/auth/require-authenticated-user.ts` (returns `null`, does not throw)
- Unauthenticated `/api/*` is also blocked at `proxy.ts` with JSON **401** before the handler runs

---

## 5. SSR hydration seeds

Protected seeds under `app/(app)/` resolve the user before prefetch:

```ts
const userId = await getAuthenticatedUserId(); // from entity repository
const initialData = await getTasksPageInitialData(userId, params);
```

`(app)/layout.tsx` already redirects guests; explicit `userId` in seeds documents intent and matches API behavior.

---

## 6. Client fetch + realtime

- `fetch("/api/notes/...", { credentials: "same-origin" })` so session cookies are sent
- Realtime: `filter: \`user_id=eq.${user.id}\`` (RLS still applies)

---

## Checklist for a new entity

| Step | Done |
| ---- | ---- |
| Migration: `user_id` column + RLS (select/insert/update/delete) | |
| Repository: `userId` first arg + `.eq("user_id", userId)` on reads/writes | |
| Use-cases: accept and forward `userId` | |
| API routes: `requireAuthenticatedUserId()` → pass `userId` | |
| SSR seed (if any): `getAuthenticatedUserId()` before prefetch | |
| Client fetch: `credentials: "same-origin"` | |
| Realtime subscription filtered by `user_id` (if used) | |
| No `auth.users` list endpoint | |

---

## Demo login (env-gated)

Try Demo is **off by default in production**. Enable only in local/staging:

```env
ENABLE_DEMO_LOGIN=true
DEMO_LOGIN_EMAIL=demo@example.com
DEMO_LOGIN_PASSWORD=DemoPass123!
DEMO_DEFAULT_MONTH=2026-06
DEMO_DEFAULT_TODAY=2026-06-15
```

Seed data (notes, tasks, reminders, payments for May–Jul 2026):

| Situation | What to run |
| --------- | ----------- |
| **Hosted Supabase, demo account already exists** | `supabase/seeds/01_demo_maya_2026.sql` in SQL Editor only |
| **Local `supabase db reset` (Docker)** | `supabase/seed.sql` (runs 00 + 01) |
| **Need to create demo auth user** | `00_demo_user.sql` then `01_demo_maya_2026.sql` |

`01` resolves the user by `demo@example.com` (edit the constant if your
`DEMO_LOGIN_EMAIL` differs). It only deletes/replaces that user's app rows.

- Credentials are **server-only** — the client form posts only `next`; `submitDemoLoginForm` reads env vars.
- Login page calls `isDemoLoginConfigured()` and hides the button when unset.
- Direct POSTs when disabled redirect to `/login?error=demo_unavailable`.
- Profile is disabled for the signed-in user whose email matches `DEMO_LOGIN_EMAIL`
  (`isDemoUserEmail`): nav link hidden, `/profile` redirects home (page + `proxy.ts`),
  non-GET `/api/profile/*` returns 403. GET `/api/profile` stays allowed for theme.
- **Demo default month:** when `DEMO_DEFAULT_MONTH` is set, month-scoped routes use that
  month for the demo email instead of today. **Demo today:** `DEMO_DEFAULT_TODAY` (or the
  mid-month fallback) keeps Home Today read/write on a day inside that month. Full data flow:
  [demo-default-month.md](../../../docs/architecture/demo-default-month.md).
- Broader session/prefs model: [docs/architecture/user-session-and-preferences.md](../../../docs/architecture/user-session-and-preferences.md)
- App lock (separate from Auth): [docs/architecture/app-lock.md](../../../docs/architecture/app-lock.md)

---

## Safe redirects

Use `getSafePath` / `getSafeAppPath` from `shared/lib/auth/get-safe-path.ts` for all post-auth redirects. Blocks `//evil.com` open redirects. Covered by `get-safe-path.test.ts`.

---

## Key files

| File | Role |
| ---- | ---- |
| `proxy.ts` | Guest pages → `/login`; guest `/api/*` → JSON 401 |
| `shared/lib/auth/require-authenticated-user.ts` | API route session check |
| `shared/lib/auth/demo-login-config.ts` | Demo login feature flag + credentials + default month/today |
| `shared/lib/auth/get-demo-session.ts` | SSR `{ userId, isDemoUser }` for hydration seeds |
| `shared/lib/auth/get-safe-path.ts` | Open-redirect-safe path normalization |
| `entities/note/repository/*.ts` | Split note repository operations; one focused responsibility per file |
| `entities/note/repository/index.ts` | Public repository barrel used by server-side consumers |
| `supabase/migrations/001_notes.sql` | Reference RLS policies |
