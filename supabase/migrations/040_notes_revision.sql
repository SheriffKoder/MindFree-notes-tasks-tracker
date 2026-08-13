-- Concurrency token for mf_notes PATCH (integer equality, not timestamptz).
-- last_edited_at remains display/sort only; revision advances on every successful UPDATE.

alter table public.mf_notes
  add column revision bigint not null default 1;

comment on column public.mf_notes.revision is
  'Monotonic concurrency token; clients send expectedRevision on PATCH.';

create or replace function public.mf_set_notes_last_edited_at()
returns trigger
language plpgsql
as $$
begin
  new.last_edited_at = now();
  new.revision = old.revision + 1;
  return new;
end;
$$;
