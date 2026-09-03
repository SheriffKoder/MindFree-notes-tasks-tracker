## Supabase Notes Table Setup

Apply the notes schema from `supabase/migrations/` to your hosted Supabase project (`001_notes.sql` plus later files through `042_note_categories.sql`).

### Prerequisites

- Auth is already configured (`docs/setup/1-supabase-auth-dashboard-setup.md`).
- App env vars are set:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

### Table prefix (`mf_`)

MindFree tables use the `mf_` prefix (e.g. `public.mf_notes`).

| Location | What to change |
| -------- | -------------- |
| `shared/config/supabase-tables.ts` | `TABLE_PREFIX` and derived constants (`NOTES_TABLE`, `NOTE_CATEGORIES_TABLE`, etc.) |
| `supabase/migrations/*.sql` | Table, index, function, trigger, and policy names |

Change these **before** the first migration apply. If you already applied migrations, add a new migration to rename tables instead of editing `001_notes.sql`.

To remove the prefix entirely, set `TABLE_PREFIX = ""` and use `notes` instead of `mf_notes` in SQL.

### Apply the migration

**Option A — Supabase Dashboard (recommended if CLI is not installed)**

1. Open your project in [Supabase Dashboard](https://app.supabase.com).
2. Go to **SQL Editor**.
3. Paste the full contents of `supabase/migrations/001_notes.sql`, then run later note migrations in order (especially `042_note_categories.sql`).
4. Run the script.

**Option B — Supabase CLI**

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### What gets created

**`001_notes.sql`**

| Object | Purpose |
| ------ | ------- |
| `public.mf_notes` | All note kinds in one table |
| `mf_notes_user_date_unique` | One calendar note per user per day |
| `mf_notes_user_quick_unique` | One quick note per user — **dropped in `042`** |
| RLS policies | Authenticated users read/write only their rows |
| `mf_notes_set_last_edited_at` trigger | Updates `last_edited_at` on every row update |

**`042_note_categories.sql`**

| Object | Purpose |
| ------ | ------- |
| `public.mf_note_categories` | User buckets for undated/quick notes |
| `mf_note_categories_user_active_name_unique` | One active name per user (case-insensitive) |
| `mf_note_categories_user_default_unique` | At most one Diary (`is_default`) per user |
| `mf_notes.category_id` | FK; null for calendar; required for undated/quick (`mf_notes_category_matches_kind`) |
| `mf_notes_user_category_quick_unique` | One quick note per user **per category** |
| `mf_notes_user_category_undated_idx` | Undated list by category |
| `mf_seed_default_note_category` | Seeds Diary on new `auth.users` rows |

### Note kinds (column rules)

| Kind | `date` | `category_id` | `is_quick` |
| ---- | ------ | ------------- | ---------- |
| Calendar | set | `NULL` | `false` |
| Undated | `NULL` | set | `false` |
| Quick (Home) | `NULL` | set | `true` |

Flags:

- `starred` — matching Home strip carousel
- `is_important` — dark red border on calendar cell

### Manual verification

Run in **SQL Editor** while signed in as a test user is not required for admin checks. Use the Table Editor or SQL with a known `user_id` from `auth.users`.

**1. Insert a calendar note (replace `<user_id>`)**

```sql
insert into public.mf_notes (user_id, date, title, content)
values ('<user_id>', '2026-07-15', 'Test day', 'Hello');
```

**2. Duplicate day should fail**

```sql
insert into public.mf_notes (user_id, date, title)
values ('<user_id>', '2026-07-15', 'Duplicate');
-- expect: unique violation on mf_notes_user_date_unique
```

**3. Insert undated and quick notes (after `042`; replace `<category_id>` with that user’s Diary id)**

```sql
insert into public.mf_notes (user_id, title, category_id)
values ('<user_id>', 'Undated note', '<category_id>');

insert into public.mf_notes (user_id, title, is_quick, category_id)
values ('<user_id>', 'Quick note', true, '<category_id>');
```

**4. Second quick note in the same category should fail**

```sql
insert into public.mf_notes (user_id, title, is_quick, category_id)
values ('<user_id>', 'Another quick', true, '<category_id>');
-- expect: unique violation on mf_notes_user_category_quick_unique
```

**5. RLS from the app**

After migration, sign in through the app and confirm requests to `public.mf_notes` via the publishable key only return the current user's rows. Unauthenticated clients must not read or write notes.

### Security notes

- RLS is enabled on `public.mf_notes` and `public.mf_note_categories`; policies scope access to `auth.uid() = user_id`.
- UPDATE requires both `USING` and `WITH CHECK` so rows cannot be reassigned to another user.
- Do not expose the `service_role` key in the Next.js app.

### Related

- Plan: `app/development/plans/02-notes-page.md` (Step 1)
- Auth setup: `docs/setup/1-supabase-auth-dashboard-setup.md`
- Quick setup: `docs/setup/0-quick-setup.md`
