-- Note categories (prefix: mf_)
-- App table names: shared/config/supabase-tables.ts
-- Undated + quick notes reference category_id.
-- Calendar notes keep category_id NULL.

create table public.mf_note_categories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  show_on_home  boolean not null default true,
  sort_order    integer not null default 0,
  is_default    boolean not null default false,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint mf_note_categories_name_nonempty check (length(trim(name)) > 0)
);

comment on table public.mf_note_categories is
  'User-managed note categories for undated/quick notes. Calendar notes do not use categories.';
comment on column public.mf_note_categories.is_default is
  'True for the seeded Diary category. Hard delete is forbidden in app logic.';
comment on column public.mf_note_categories.deleted_at is
  'Soft-delete timestamp. NULL = active. Archived categories are hidden from views until restored.';
comment on column public.mf_note_categories.show_on_home is
  'When true and active, Home shows a strip (including empty quick placeholder).';

-- One active category name per user (case-insensitive)
create unique index mf_note_categories_user_active_name_unique
  on public.mf_note_categories (user_id, lower(name))
  where deleted_at is null;

-- At most one default category per user (active or archived)
create unique index mf_note_categories_user_default_unique
  on public.mf_note_categories (user_id)
  where is_default = true;

create index mf_note_categories_user_active_sort_idx
  on public.mf_note_categories (user_id, sort_order, created_at)
  where deleted_at is null;

create trigger mf_note_categories_set_updated_at
  before update on public.mf_note_categories
  for each row
  execute function public.mf_set_updated_at();

alter table public.mf_note_categories enable row level security;

create policy "mf_note_categories_select_own"
  on public.mf_note_categories for select to authenticated
  using (auth.uid() = user_id);

create policy "mf_note_categories_insert_own"
  on public.mf_note_categories for insert to authenticated
  with check (auth.uid() = user_id);

create policy "mf_note_categories_update_own"
  on public.mf_note_categories for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mf_note_categories_delete_own"
  on public.mf_note_categories for delete to authenticated
  using (auth.uid() = user_id);

-- Seed Diary for every existing user
insert into public.mf_note_categories (user_id, name, show_on_home, sort_order, is_default)
select u.id, 'Diary', true, 0, true
from auth.users u
where not exists (
  select 1 from public.mf_note_categories c
  where c.user_id = u.id and c.is_default = true
);

-- Attach FK on notes (nullable first, then backfill undated)
alter table public.mf_notes
  add column category_id uuid references public.mf_note_categories (id) on delete cascade;

comment on column public.mf_notes.category_id is
  'NULL for calendar notes. Required for undated and quick notes.';

-- Point existing undated/quick notes at the user Diary category
update public.mf_notes n
set category_id = c.id
from public.mf_note_categories c
where c.user_id = n.user_id
  and c.is_default = true
  and n.date is null
  and n.category_id is null;

-- Enforce kind ↔ category invariant
alter table public.mf_notes
  add constraint mf_notes_category_matches_kind check (
    (date is not null and category_id is null)
    or (date is null and category_id is not null)
  );

-- Replace one-quick-per-user with one-quick-per-category
drop index if exists public.mf_notes_user_quick_unique;

create unique index mf_notes_user_category_quick_unique
  on public.mf_notes (user_id, category_id)
  where is_quick = true;

-- Undated list index becomes category-aware
drop index if exists public.mf_notes_user_general_idx;

create index mf_notes_user_category_undated_idx
  on public.mf_notes (user_id, category_id)
  where date is null and is_quick = false;

-- New-user Diary seed
create or replace function public.mf_seed_default_note_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.mf_note_categories c
    where c.user_id = new.id and c.is_default = true
  ) then
    insert into public.mf_note_categories (user_id, name, show_on_home, sort_order, is_default)
    values (new.id, 'Diary', true, 0, true);
  end if;
  return new;
end;
$$;

drop trigger if exists mf_seed_default_note_category on auth.users;
create trigger mf_seed_default_note_category
  after insert on auth.users
  for each row
  execute function public.mf_seed_default_note_category();
