-- One-time (idempotent) Home isolation fixtures for mf_testing_*.
-- Requires 043 (tables) + 044 (auth users A/B). Re-run safe: replaces
-- only rows owned by the isolation user ids.

do $seed$
declare
  user_a constant uuid := 'a2222222-2222-4222-8222-222222222222';
  user_b constant uuid := 'b3333333-3333-4333-8333-333333333333';

  -- Categories
  cat_a constant uuid := 'a2000001-0001-4001-8001-000000000001';
  cat_b constant uuid := 'b3000001-0001-4001-8001-000000000001';

  -- Notes (quick + starred per user)
  note_a_quick    constant uuid := 'a2000002-0002-4002-8002-000000000002';
  note_a_starred  constant uuid := 'a2000003-0003-4003-8003-000000000003';
  note_b_quick    constant uuid := 'b3000002-0002-4002-8002-000000000002';
  note_b_starred  constant uuid := 'b3000003-0003-4003-8003-000000000003';

  -- Activities
  task_a     constant uuid := 'a2000010-0010-4010-8010-000000000010';
  reminder_a constant uuid := 'a2000011-0011-4011-8011-000000000011';
  task_b     constant uuid := 'b3000010-0010-4010-8010-000000000010';
  reminder_b constant uuid := 'b3000011-0011-4011-8011-000000000011';

  -- Records (one day each)
  record_a constant uuid := 'a2000020-0020-4020-8020-000000000020';
  record_b constant uuid := 'b3000020-0020-4020-8020-000000000020';

  -- Payments
  payment_a constant uuid := 'a2000030-0030-4030-8030-000000000030';
  payment_b constant uuid := 'b3000030-0030-4030-8030-000000000030';

  fixture_date constant date := '2026-09-20';
begin
  if not exists (select 1 from auth.users where id = user_a)
     or not exists (select 1 from auth.users where id = user_b) then
    raise exception
      'Isolation auth users missing. Apply migration 044 first.';
  end if;

  -- Wipe prior fixtures for A/B only (never touches mf_* or other users).
  delete from public.mf_testing_notes
  where user_id in (user_a, user_b);

  delete from public.mf_testing_note_categories
  where user_id in (user_a, user_b);

  delete from public.mf_testing_task_record
  where user_id in (user_a, user_b);

  delete from public.mf_testing_task
  where user_id in (user_a, user_b);

  delete from public.mf_testing_payments
  where user_id in (user_a, user_b);

  -- Categories -------------------------------------------------------------
  insert into public.mf_testing_note_categories (
    id, user_id, name, show_on_home, sort_order, is_default
  ) values
    (cat_a, user_a, 'Diary', true, 0, true),
    (cat_b, user_b, 'Diary', true, 0, true);

  -- Notes ------------------------------------------------------------------
  insert into public.mf_testing_notes (
    id, user_id, date, title, content, starred, is_important, is_quick,
    category_id
  ) values
    (
      note_a_quick, user_a, null, 'A quick', 'User A quick note',
      false, false, true, cat_a
    ),
    (
      note_a_starred, user_a, null, 'A starred', 'User A starred note',
      true, false, false, cat_a
    ),
    (
      note_b_quick, user_b, null, 'B quick', 'User B quick note',
      false, false, true, cat_b
    ),
    (
      note_b_starred, user_b, null, 'B starred', 'User B starred note',
      true, false, false, cat_b
    );

  -- Tasks + reminders ------------------------------------------------------
  insert into public.mf_testing_task (
    id, user_id, kind, title, description, color, tracking_mode,
    schedule_type, schedule_config, goal, goal_duration,
    goal_period, period_goal, period_goal_duration, priority,
    starts_at, ends_at, archived_at
  ) values
    (
      task_a, user_a, 'task', 'A daily task', 'Owned by isolation A',
      '#3b82f6', 'boolean', 'daily', null,
      null, null, null, null, null, 'high',
      '2026-09-01', null, null
    ),
    (
      reminder_a, user_a, 'reminder', 'A reminder', 'Owned by isolation A',
      '#f59e0b', 'boolean', 'daily', null,
      null, null, null, null, null, 'medium',
      '2026-09-01', null, null
    ),
    (
      task_b, user_b, 'task', 'B daily task', 'Owned by isolation B',
      '#ef4444', 'boolean', 'daily', null,
      null, null, null, null, null, 'high',
      '2026-09-01', null, null
    ),
    (
      reminder_b, user_b, 'reminder', 'B reminder', 'Owned by isolation B',
      '#a855f7', 'boolean', 'daily', null,
      null, null, null, null, null, 'medium',
      '2026-09-01', null, null
    );

  -- Records ----------------------------------------------------------------
  insert into public.mf_testing_task_record (
    id, user_id, task_id, date, count, duration, description,
    tracking_mode_snapshot, goal_snapshot, goal_duration_snapshot
  ) values
    (
      record_a, user_a, task_a, fixture_date, 1, 0, null,
      'boolean', null, null
    ),
    (
      record_b, user_b, task_b, fixture_date, 1, 0, null,
      'boolean', null, null
    );

  -- Payments ---------------------------------------------------------------
  insert into public.mf_testing_payments (
    id, user_id, title, amount, description, date, "group"
  ) values
    (
      payment_a, user_a, 'A coffee', 4.50, 'Owned by isolation A',
      fixture_date, 'food'
    ),
    (
      payment_b, user_b, 'B lunch', 12.00, 'Owned by isolation B',
      fixture_date, 'food'
    );
end $seed$;
