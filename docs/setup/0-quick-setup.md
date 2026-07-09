# Quick Setup

Get MindFree running locally after cloning the repo.

**Time:** ~15 minutes (first time, including Supabase project setup)

---

## 1. Install dependencies

```bash
git clone <repo-url>
cd notes-tasks-app
npm install
```

---

## 2. Environment variables

Copy the example env file and fill in your Supabase project values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-or-anon-key>
```

Where to find them:

1. Open [Supabase Dashboard](https://app.supabase.com) → your project
2. Go to **Project Settings → API**
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **publishable** key (or legacy `anon` key) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

> Do **not** put the `service_role` / secret key in `.env` with a `NEXT_PUBLIC_` prefix. The app only needs the public publishable key.

---

## 3. Configure Supabase Auth (dashboard)

Env vars alone are not enough — the hosted Supabase project must be configured for email confirmation, OAuth redirects, and sign-up.

Continue with the full auth checklist:

**→ [Supabase Auth Dashboard Setup](./1-supabase-auth-dashboard-setup.md)**

At minimum, complete:

- URL configuration (`Site URL`, redirect URLs for `/auth/confirm` and `/auth/callback`)
- Email provider + confirm email enabled
- Google OAuth (optional but supported by the app)

---

## 4. Apply database migrations

The app stores notes in `public.mf_notes` (MindFree `mf_` table prefix). Apply the migration once per Supabase project.

### Table prefix (optional)

Default prefix is `mf_`. To change or remove it, see **[Changing the table prefix](#changing-the-table-prefix)** at the end of this doc before running migrations.

### Option A — Supabase CLI (recommended)

**Install the CLI**

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# Or npm (global)
npm install supabase

# Verify
npx supabase --version
```

**Link and push**

```bash
# Log in (opens browser)
npx supabase login

# One-time: create local supabase config if missing
npx supabase init

# Link to your remote project (ref is in the dashboard URL)
npx supabase link --project-ref <your-project-ref>

# Apply migrations in supabase/migrations/
npx supabase db push
```

Your project ref is the segment in `https://app.supabase.com/project/<project-ref>`.

**Confirm**

```bash
npx supabase migration list
```

You should see `001_notes` applied.

### Option B — SQL Editor (no CLI)

1. Open [Supabase Dashboard](https://app.supabase.com) → **SQL Editor**
2. Paste the full contents of [`supabase/migrations/001_notes.sql`](../../supabase/migrations/001_notes.sql)
3. Run the script

More detail and verification queries: **[Supabase Notes Table Setup](./2-supabase-notes-setup.md)**

---

## 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 6. Smoke test

Work through this once after setup:

| # | Check |
| - | ----- |
| 1 | Sign up with email/password at `/signup` |
| 2 | Confirm email (check inbox; link hits `/auth/confirm`) |
| 3 | Sign in at `/login` |
| 4 | Protected routes load (e.g. `/`, `/notes`) |
| 5 | Sign out redirects to `/login` |
| 6 | Google sign-in works (if configured) |
| 7 | `public.mf_notes` exists in Supabase **Table Editor** |

---

## Setup docs index

| Doc | When to use |
| --- | ----------- |
| [0-quick-setup.md](./0-quick-setup.md) | Start here after clone |
| [1-supabase-auth-dashboard-setup.md](./1-supabase-auth-dashboard-setup.md) | Auth providers, redirects, email templates |
| [2-supabase-notes-setup.md](./2-supabase-notes-setup.md) | Notes migration details and SQL verification |

---

## Troubleshooting

**`Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`**

- `.env` is missing or not loaded — restart `npm run dev` after editing `.env`.

**Sign-up works but confirmation link fails**

- Re-check redirect URLs in Supabase **Authentication → URL Configuration** and the email template in [auth setup](./1-supabase-auth-dashboard-setup.md).

**`supabase db push` fails on link**

- Run `supabase login` again.
- Confirm `<project-ref>` matches your dashboard URL.

**Notes features error at runtime**

- Confirm `001_notes.sql` was applied (`public.mf_notes` visible in Table Editor).

---

## Changing the table prefix

MindFree uses the `mf_` prefix on Supabase tables (e.g. `mf_notes`). You only need to change this if you want unprefixed names like `notes`.

**Before the first migration apply:**

1. **`shared/config/supabase-tables.ts`** — set `TABLE_PREFIX` (use `""` for no prefix) and update `NOTES_TABLE`.
2. **`supabase/migrations/001_notes.sql`** — rename the table and all related indexes, functions, triggers, and policies to match.

**After migrations are already applied:** do not edit `001_notes.sql`. Add a new migration that renames tables instead.

App code should always use `NOTES_TABLE` from `shared/config/supabase-tables.ts`, not hard-coded table strings.

See also: [2-supabase-notes-setup.md](./2-supabase-notes-setup.md#table-prefix-mf_).
