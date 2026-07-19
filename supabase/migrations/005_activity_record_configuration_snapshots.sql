-- Freeze the tracking configuration used when each activity record is created.
-- Precondition: no records exist; historical configuration cannot be inferred.

do $$
begin
  if exists (select 1 from public.mf_task_record limit 1) then
    raise exception
      'Migration 005 requires an empty mf_task_record table; existing record snapshots cannot be inferred.';
  end if;
end;
$$;

alter table public.mf_task_record
  add column tracking_mode_snapshot text not null,
  add column goal_snapshot integer,
  add column goal_duration_snapshot integer,
  add constraint mf_task_record_tracking_mode_snapshot_valid check (
    tracking_mode_snapshot in ('boolean', 'count', 'duration', 'count+duration')
  ),
  add constraint mf_task_record_goal_snapshot_valid check (
    goal_snapshot is null or goal_snapshot > 0
  ),
  add constraint mf_task_record_goal_duration_snapshot_valid check (
    goal_duration_snapshot is null or goal_duration_snapshot > 0
  );

comment on column public.mf_task_record.tracking_mode_snapshot is
  'Immutable tracking mode copied from mf_task when this daily record is first inserted.';
comment on column public.mf_task_record.goal_snapshot is
  'Immutable count goal copied from mf_task when this daily record is first inserted.';
comment on column public.mf_task_record.goal_duration_snapshot is
  'Immutable duration goal in minutes copied from mf_task when this daily record is first inserted.';

create or replace function public.mf_task_record_set_configuration_snapshot()
returns trigger
language plpgsql
as $$
declare
  task_tracking_mode text;
  task_goal integer;
  task_goal_duration integer;
begin
  if tg_op = 'INSERT' then
    select tracking_mode, goal, goal_duration
      into task_tracking_mode, task_goal, task_goal_duration
      from public.mf_task
      where id = new.task_id
        and user_id = new.user_id;

    if not found then
      raise exception
        'Cannot create activity record: no owned task matches task_id %.',
        new.task_id;
    end if;

    new.tracking_mode_snapshot = task_tracking_mode;
    new.goal_snapshot = task_goal;
    new.goal_duration_snapshot = task_goal_duration;
  else
    new.tracking_mode_snapshot = old.tracking_mode_snapshot;
    new.goal_snapshot = old.goal_snapshot;
    new.goal_duration_snapshot = old.goal_duration_snapshot;
  end if;

  return new;
end;
$$;

create trigger mf_task_record_set_configuration_snapshot
  before insert or update on public.mf_task_record
  for each row
  execute function public.mf_task_record_set_configuration_snapshot();
