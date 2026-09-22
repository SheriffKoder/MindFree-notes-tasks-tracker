-- Testing twins for Home tenant-isolation Vitest runs (prefix: mf_testing_).
-- Mirrors the live Home-relevant schema after 001–011, 040, 042.
-- Does not touch mf_* app tables, does not seed auth.users, and is not
-- published to realtime. Point test TABLE_PREFIX / table constants at these
-- names only — never use them from the running app.
-- euses mf_set_updated_at / mf_set_notes_last_edited_at. No auth seed trigger, no realtime, no writes to mf_*.


-- ---------------------------------------------------------------------------
-- mf_testing_note_categories
-- ---------------------------------------------------------------------------

create table public.mf_testing_note_categories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  show_on_home  boolean not null default true,
  sort_order    integer not null default 0,
  is_default    boolean not null default false,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint mf_testing_note_categories_name_nonempty check (
    length(trim(name)) > 0
  )
);

comment on table public.mf_testing_note_categories is
  'TEST ONLY — twin of mf_note_categories for Home isolation tests.';

create unique index mf_testing_note_categories_user_active_name_unique
  on public.mf_testing_note_categories (user_id, lower(name))
  where deleted_at is null;

create unique index mf_testing_note_categories_user_default_unique
  on public.mf_testing_note_categories (user_id)
  where is_default = true;

create index mf_testing_note_categories_user_active_sort_idx
  on public.mf_testing_note_categories (user_id, sort_order, created_at)
  where deleted_at is null;

create trigger mf_testing_note_categories_set_updated_at
  before update on public.mf_testing_note_categories
  for each row
  execute function public.mf_set_updated_at();

alter table public.mf_testing_note_categories enable row level security;

create policy "mf_testing_note_categories_select_own"
  on public.mf_testing_note_categories for select to authenticated
  using (auth.uid() = user_id);

create policy "mf_testing_note_categories_insert_own"
  on public.mf_testing_note_categories for insert to authenticated
  with check (auth.uid() = user_id);

create policy "mf_testing_note_categories_update_own"
  on public.mf_testing_note_categories for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_testing_note_categories_delete_own"
  on public.mf_testing_note_categories for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- mf_testing_notes
-- ---------------------------------------------------------------------------

create table public.mf_testing_notes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  date           date,
  title          text not null default '',
  content        text not null default '',
  starred        boolean not null default false,
  is_important   boolean not null default false,
  is_quick       boolean not null default false,
  last_edited_at timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  revision       bigint not null default 1,
  category_id    uuid references public.mf_testing_note_categories (id)
                   on delete cascade,

  constraint mf_testing_notes_quick_requires_null_date check (
    not (is_quick and date is not null)
  ),
  constraint mf_testing_notes_category_matches_kind check (
    (date is not null and category_id is null)
    or (date is null and category_id is not null)
  )
);

comment on table public.mf_testing_notes is
  'TEST ONLY — twin of mf_notes for Home isolation tests.';

create unique index mf_testing_notes_user_date_unique
  on public.mf_testing_notes (user_id, date)
  where date is not null;

create unique index mf_testing_notes_user_category_quick_unique
  on public.mf_testing_notes (user_id, category_id)
  where is_quick = true;

create index mf_testing_notes_user_month_idx
  on public.mf_testing_notes (user_id, date)
  where date is not null;

create index mf_testing_notes_user_category_undated_idx
  on public.mf_testing_notes (user_id, category_id)
  where date is null and is_quick = false;

create index mf_testing_notes_user_starred_idx
  on public.mf_testing_notes (user_id, starred)
  where starred = true;

-- Reuses live trigger fn (bumps last_edited_at + revision).
create trigger mf_testing_notes_set_last_edited_at
  before update on public.mf_testing_notes
  for each row
  execute function public.mf_set_notes_last_edited_at();

alter table public.mf_testing_notes enable row level security;

create policy "mf_testing_notes_select_own"
  on public.mf_testing_notes for select to authenticated
  using (auth.uid() = user_id);

create policy "mf_testing_notes_insert_own"
  on public.mf_testing_notes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "mf_testing_notes_update_own"
  on public.mf_testing_notes for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_testing_notes_delete_own"
  on public.mf_testing_notes for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- mf_testing_task
-- ---------------------------------------------------------------------------

create table public.mf_testing_task (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  kind                 text not null check (kind in ('task', 'reminder')),
  title                text not null default '',
  description          text,
  color                text,
  tracking_mode        text not null check (
                         tracking_mode in (
                           'boolean', 'count', 'duration', 'count+duration'
                         )
                       ),
  schedule_type        text not null check (
                         schedule_type in (
                           'once', 'daily', 'weekly', 'monthly', 'yearly'
                         )
                       ),
  schedule_config      jsonb,
  goal                 integer check (goal is null or goal > 0),
  goal_duration        integer check (
                         goal_duration is null or goal_duration > 0
                       ),
  icon                 text,
  goal_period          text check (
                         goal_period is null or goal_period in ('week', 'month')
                       ),
  period_goal          integer check (period_goal is null or period_goal > 0),
  period_goal_duration integer check (
                         period_goal_duration is null or period_goal_duration > 0
                       ),
  priority             text check (
                         priority is null
                         or priority in ('low', 'medium', 'high')
                       ),
  starts_at            date,
  ends_at              date,
  archived_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint mf_testing_task_window_valid check (
    starts_at is null or ends_at is null or ends_at >= starts_at
  )
);

comment on table public.mf_testing_task is
  'TEST ONLY — twin of mf_task for Home isolation tests.';

create index mf_testing_task_user_kind_idx
  on public.mf_testing_task (user_id, kind);

create trigger mf_testing_task_set_updated_at
  before update on public.mf_testing_task
  for each row
  execute function public.mf_set_updated_at();

alter table public.mf_testing_task enable row level security;

create policy "mf_testing_task_select_own"
  on public.mf_testing_task for select to authenticated
  using (auth.uid() = user_id);

create policy "mf_testing_task_insert_own"
  on public.mf_testing_task for insert to authenticated
  with check (auth.uid() = user_id);

create policy "mf_testing_task_update_own"
  on public.mf_testing_task for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_testing_task_delete_own"
  on public.mf_testing_task for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- mf_testing_task_record
-- ---------------------------------------------------------------------------

create table public.mf_testing_task_record (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users (id) on delete cascade,
  task_id                uuid not null references public.mf_testing_task (id)
                           on delete cascade,
  date                   date not null,
  count                  integer not null default 0 check (count >= 0),
  duration               integer not null default 0 check (duration >= 0),
  description            text,
  tracking_mode_snapshot text not null check (
                           tracking_mode_snapshot in (
                             'boolean', 'count', 'duration', 'count+duration'
                           )
                         ),
  goal_snapshot          integer check (
                           goal_snapshot is null or goal_snapshot > 0
                         ),
  goal_duration_snapshot integer check (
                           goal_duration_snapshot is null
                           or goal_duration_snapshot > 0
                         ),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint mf_testing_task_record_task_date_unique unique (task_id, date)
);

comment on table public.mf_testing_task_record is
  'TEST ONLY — twin of mf_task_record for Home isolation tests.';

create index mf_testing_task_record_user_date_idx
  on public.mf_testing_task_record (user_id, date);

create index mf_testing_task_record_task_idx
  on public.mf_testing_task_record (task_id);

create trigger mf_testing_task_record_set_updated_at
  before update on public.mf_testing_task_record
  for each row
  execute function public.mf_set_updated_at();

alter table public.mf_testing_task_record enable row level security;

create policy "mf_testing_task_record_select_own"
  on public.mf_testing_task_record for select to authenticated
  using (auth.uid() = user_id);

create policy "mf_testing_task_record_insert_own"
  on public.mf_testing_task_record for insert to authenticated
  with check (auth.uid() = user_id);

create policy "mf_testing_task_record_update_own"
  on public.mf_testing_task_record for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_testing_task_record_delete_own"
  on public.mf_testing_task_record for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- mf_testing_payments
-- ---------------------------------------------------------------------------

create table public.mf_testing_payments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default '',
  amount      numeric(12, 2) not null default 0 check (amount >= 0),
  description text not null default '',
  date        date not null,
  "group"     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.mf_testing_payments is
  'TEST ONLY — twin of mf_payments for Home isolation tests.';

create index mf_testing_payments_user_date_idx
  on public.mf_testing_payments (user_id, date);

create index mf_testing_payments_user_updated_at_idx
  on public.mf_testing_payments (user_id, updated_at desc);

create trigger mf_testing_payments_set_updated_at
  before update on public.mf_testing_payments
  for each row
  execute function public.mf_set_updated_at();

alter table public.mf_testing_payments enable row level security;

create policy "mf_testing_payments_select_own"
  on public.mf_testing_payments for select to authenticated
  using (auth.uid() = user_id);

create policy "mf_testing_payments_insert_own"
  on public.mf_testing_payments for insert to authenticated
  with check (auth.uid() = user_id);

create policy "mf_testing_payments_update_own"
  on public.mf_testing_payments for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_testing_payments_delete_own"
  on public.mf_testing_payments for delete to authenticated
  using (auth.uid() = user_id);
