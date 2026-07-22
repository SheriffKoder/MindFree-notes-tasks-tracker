-- Demo sample data — Maya Chen persona (May–Jul 2026).
--
-- HOSTED SUPABASE (existing demo account, no Docker, no db reset):
--   1. Open SQL Editor in your project dashboard.
--   2. Paste this entire file and Run.
--   3. Do NOT run 00_demo_user.sql unless you need to create the auth user.
--
-- Safe scope: resolves user by DEMO_LOGIN_EMAIL only; deletes/replaces that
-- user's mf_notes, mf_task (+ records via cascade), and mf_payments rows.
-- Other accounts are never touched.
--
-- Change demo_email below if your DEMO_LOGIN_EMAIL differs.

do $seed$
declare
  v_user_id uuid;
  demo_email constant text := 'demo@example.com';

  -- Task definitions
  t_deep_work uuid := 'b1111111-1111-4111-8111-111111111111';
  t_move_body uuid := 'b2222222-2222-4222-8222-222222222222';
  t_code_review uuid := 'b3333333-3333-4333-8333-333333333333';
  t_cook_meal uuid := 'b4444444-4444-4444-8444-444444444444';
  t_weekly_plan uuid := 'b5555555-5555-4555-8555-555555555555';
  t_long_run uuid := 'b6666666-6666-4666-8666-666666666666';

  -- Reminders
  r_log_off uuid := 'c1111111-1111-4111-8111-111111111111';
  r_dentist uuid := 'c2222222-2222-4222-8222-222222222222';
  r_domain uuid := 'c3333333-3333-4333-8333-333333333333';
begin
  select id into v_user_id
  from auth.users
  where lower(email) = lower(demo_email)
  limit 1;

  if v_user_id is null then
    raise exception
      'No auth user with email %. Create the demo account first or change demo_email in this script.',
      demo_email;
  end if;

  update public.mf_profiles
  set display_name = 'Maya Chen'
  where id = v_user_id;

  delete from public.mf_payments where user_id = v_user_id;
  delete from public.mf_notes where user_id = v_user_id;
  delete from public.mf_task where user_id = v_user_id;

  -- -------------------------------------------------------------------------
  -- Activity definitions (4 daily tasks + 2 periodic + 3 reminders)
  -- -------------------------------------------------------------------------

  insert into public.mf_task (
    id, user_id, kind, title, description, color, tracking_mode,
    schedule_type, schedule_config, goal, goal_duration,
    goal_period, period_goal, period_goal_duration, priority,
    starts_at, ends_at, archived_at
  ) values
  (
    t_deep_work, v_user_id, 'task', 'Deep work',
    'No Slack before lunch — focus block for hard problems.',
    '#3b82f6', 'duration', 'daily', null,
    null, 120, null, null, null, 'high',
    '2026-05-01', null, null
  ),
  (
    t_move_body, v_user_id, 'task', 'Move body',
    'Run, gym, or walk — something that gets heart rate up.',
    '#22c55e', 'duration', 'daily', null,
    null, 30, null, null, null, 'medium',
    '2026-05-01', null, null
  ),
  (
    t_code_review, v_user_id, 'task', 'Code review',
    'Review teammate PRs with kind, specific feedback.',
    '#8b5cf6', 'count', 'daily', null,
    2, null, null, null, null, 'medium',
    '2026-05-01', null, null
  ),
  (
    t_cook_meal, v_user_id, 'task', 'Cook real meal',
    'Skip delivery — something with actual vegetables.',
    '#f97316', 'boolean', 'daily', null,
    null, null, null, null, null, 'low',
    '2026-05-01', null, null
  ),
  (
    t_weekly_plan, v_user_id, 'task', 'Weekly planning',
    'Review calendar, pick top 3 outcomes for the week.',
    '#06b6d4', 'boolean', 'weekly', '["sun"]'::jsonb,
    null, null, null, null, null, 'medium',
    '2026-05-01', null, null
  ),
  (
    t_long_run, v_user_id, 'task', 'Long run',
    'Easy pace — phone stays home.',
    '#22c55e', 'duration', 'weekly', '["sat"]'::jsonb,
    null, 60, null, null, null, 'medium',
    '2026-05-01', null, null
  ),
  (
    r_log_off, v_user_id, 'reminder', 'Log off by 6pm',
    'Close laptop; walk or stretch before dinner.',
    null, 'boolean', 'daily', null,
    null, null, null, null, null, null,
    '2026-05-01', null, null
  ),
  (
    r_dentist, v_user_id, 'reminder', 'Dentist — 6-month cleaning',
    'Dr. Kim, 2:30pm. Bring insurance card.',
    null, 'boolean', 'once', '"2026-06-20"'::jsonb,
    null, null, null, null, null, null,
    null, null, null
  ),
  (
    r_domain, v_user_id, 'reminder', 'Renew domain',
    'mayachen.dev — auto-renew is off this year.',
    null, 'boolean', 'once', '"2026-07-01"'::jsonb,
    null, null, null, null, null, null,
    null, null, null
  );

  -- -------------------------------------------------------------------------
  -- Task records — June 2026 weekdays (hero month) + May/Jul samples
  -- -------------------------------------------------------------------------

  insert into public.mf_task_record (
    user_id, task_id, date, count, duration, description,
    tracking_mode_snapshot, goal_snapshot, goal_duration_snapshot
  ) values
  -- Deep work — June weekdays
  (v_user_id, t_deep_work, '2026-06-01', 0, 110, 'Auth refactor block', 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-02', 0, 95, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-03', 0, 120, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-04', 0, 0, 'Meetings all day', 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-05', 0, 125, 'Ship day focus', 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-08', 0, 88, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-09', 0, 105, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-10', 0, 120, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-11', 0, 75, 'Short block before meetup', 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-12', 0, 130, 'Payments integration', 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-15', 0, 90, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-16', 0, 0, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-17', 0, 115, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-18', 0, 100, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-19', 0, 85, 'Conference day — light', 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-22', 0, 120, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-23', 0, 95, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-24', 0, 110, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-25', 0, 0, 'Dentist afternoon', 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-26', 0, 105, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-29', 0, 90, null, 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-06-30', 0, 115, 'Q2 wrap-up', 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-05-12', 0, 100, 'On-call week debugging', 'duration', null, 120),
  (v_user_id, t_deep_work, '2026-07-22', 0, 80, 'First week back', 'duration', null, 120),

  -- Move body — June sample
  (v_user_id, t_move_body, '2026-06-01', 0, 30, 'Morning run', 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-02', 0, 25, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-03', 0, 45, 'Gym + stretch', 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-04', 0, 0, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-05', 0, 35, 'Celebration gym session', 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-08', 0, 30, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-09', 0, 0, 'Rain — skipped', 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-10', 0, 40, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-11', 0, 30, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-12', 0, 45, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-15', 0, 30, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-16', 0, 25, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-17', 0, 30, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-18', 0, 0, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-19', 0, 20, 'Walk to meetup', 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-22', 0, 35, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-23', 0, 30, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-24', 0, 45, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-25', 0, 0, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-06-26', 0, 30, null, 'duration', null, 30),
  (v_user_id, t_move_body, '2026-07-12', 0, 50, 'Lake walk', 'duration', null, 30),

  -- Code review — June weekdays
  (v_user_id, t_code_review, '2026-06-01', 2, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-02', 1, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-03', 3, 0, 'Heavy review day', 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-04', 0, 0, 'No bandwidth', 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-05', 2, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-08', 1, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-09', 2, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-10', 2, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-11', 1, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-12', 2, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-15', 0, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-16', 2, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-17', 1, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-18', 2, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-19', 0, 0, 'Out at conference', 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-22', 3, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-23', 2, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-24', 1, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-25', 0, 0, null, 'count', 2, null),
  (v_user_id, t_code_review, '2026-06-26', 2, 0, null, 'count', 2, null),

  -- Cook real meal — June (boolean via count)
  (v_user_id, t_cook_meal, '2026-06-01', 1, 0, 'Salmon + rice', 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-02', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-03', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-04', 0, 0, 'Ate out with team', 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-05', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-08', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-09', 0, 0, 'Delivery', 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-10', 1, 0, 'Meal prep bowls', 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-11', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-12', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-15', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-16', 0, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-17', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-18', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-19', 0, 0, 'Meetup dinner', 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-22', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-23', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-24', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-25', 0, 0, 'Soft food after dentist', 'boolean', null, null),
  (v_user_id, t_cook_meal, '2026-06-26', 1, 0, null, 'boolean', null, null),

  -- Weekly planning — Sundays
  (v_user_id, t_weekly_plan, '2026-05-25', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_weekly_plan, '2026-06-01', 1, 0, 'June priorities', 'boolean', null, null),
  (v_user_id, t_weekly_plan, '2026-06-08', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_weekly_plan, '2026-06-15', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_weekly_plan, '2026-06-22', 1, 0, null, 'boolean', null, null),
  (v_user_id, t_weekly_plan, '2026-06-29', 1, 0, 'Q2 close-out', 'boolean', null, null),
  (v_user_id, t_weekly_plan, '2026-07-06', 1, 0, 'Vacation week — minimal', 'boolean', null, null),

  -- Long run — Saturdays
  (v_user_id, t_long_run, '2026-05-31', 0, 55, null, 'duration', null, 60),
  (v_user_id, t_long_run, '2026-06-07', 0, 62, null, 'duration', null, 60),
  (v_user_id, t_long_run, '2026-06-14', 0, 58, null, 'duration', null, 60),
  (v_user_id, t_long_run, '2026-06-21', 0, 65, 'Longest this month', 'duration', null, 60),
  (v_user_id, t_long_run, '2026-06-28', 0, 60, null, 'duration', null, 60),
  (v_user_id, t_long_run, '2026-07-05', 0, 0, 'Travel day', 'duration', null, 60),

  -- Daily log-off reminder — partial June completion
  (v_user_id, r_log_off, '2026-06-01', 1, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-02', 1, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-03', 0, 0, 'Late deploy', 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-04', 1, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-05', 1, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-10', 1, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-11', 1, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-12', 1, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-17', 0, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-18', 1, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-19', 1, 0, 'Left laptop at home', 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-24', 1, 0, null, 'boolean', null, null),
  (v_user_id, r_log_off, '2026-06-25', 1, 0, null, 'boolean', null, null),

  -- One-off reminders
  (v_user_id, r_dentist, '2026-06-20', 1, 0, 'Cleaning done', 'boolean', null, null);

  -- r_domain left open (no record) until July demo browsing

  -- -------------------------------------------------------------------------
  -- Notes — 4 calendar entries per month + 1 quick note
  -- -------------------------------------------------------------------------

  insert into public.mf_notes (
    id, user_id, date, title, content, starred, is_important, is_quick, last_edited_at
  ) values
  (
    'd1111111-1111-4111-8111-111111111101',
    v_user_id, '2026-05-08', 'Friday retro', $$
End of sprint 23. Shipped the notification preferences UI. Retro surfaced that we are still underestimating QA time — I said it out loud instead of nodding along. Took a long walk after work; brain needed the reset. Small win: finally deleted 200 lines of dead feature-flag code.
$$, true, false, false, '2026-05-08 20:00:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111102',
    v_user_id, '2026-05-17', 'Weekend kitchen experiment', $$
Slow-cooked shakshuka for friends. One of them asked about my productivity app and I realized I have been building the thing I actually want to use. Note to self: dogfood more, talk less.
$$, false, false, false, '2026-05-17 21:30:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111103',
    v_user_id, '2026-05-24', 'On-call week', $$
On-call Mon–Fri. Two pages: one false alarm (stale cache), one real latency spike on the payments read path. Postmortem draft due Tuesday. Feeling the tension between move fast and sleep normally. Blocked Saturday hike — rescheduling matters.
$$, false, true, false, '2026-05-24 22:15:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111104',
    v_user_id, '2026-05-31', 'May close-out', $$
Month felt fragmented until the last two weeks. Read Staff Engineer ch. 3 on technical direction — clicked with how our team argues about abstractions. June goal: protect two 90-minute deep-work blocks per day, not just promise them in standup.
$$, true, false, false, '2026-05-31 19:00:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111105',
    v_user_id, '2026-06-05', 'Auth refactor landed', $$
Merged the session refresh refactor after three review rounds. Tests green, staging looks good, still nervous about edge cases around expired tokens. Celebrated with early gym instead of late deploy — progress.
$$, true, true, false, '2026-06-05 18:00:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111106',
    v_user_id, '2026-06-12', 'Mid-month check-in', $$
Halfway through June and energy is better than May. Morning runs are sticking (4x this week). Work: picking up payments entity integration. Life: booked July cabin trip with Sam — offline week will be good for both of us.
$$, true, false, false, '2026-06-12 17:30:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111107',
    v_user_id, '2026-06-19', 'Conference day 1', $$
Local React meetup. Talk on server components was practical, not hype. Met two engineers doing offline-first mobile — swapped notes on sync patterns. Home by 9; did not open laptop. That is the balanced-life experiment.
$$, false, false, false, '2026-06-19 23:00:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111108',
    v_user_id, '2026-06-28', 'Q2 reflection', $$
Quarter wrap. Shipped: auth hardening, Home quick-adds, progress page polish. Missed: reading list (only 2 articles). Proud of saying no to a scope creep ticket. July focus: finish payments flow, take real vacation, do not check Slack on the cabin porch.
$$, true, false, false, '2026-06-28 20:45:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111109',
    v_user_id, '2026-07-03', 'Pre-vacation handoff', $$
Handoff doc done. Covered payments month-nav bug and open PR #47. Set OOO reply. Weirdly hard to disconnect — wrote this note to mark the mental boundary.
$$, false, true, false, '2026-07-03 16:00:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111110',
    v_user_id, '2026-07-12', 'Cabin morning', $$
Day 4 offline. Coffee, lake walk, paperback sci-fi. Remembered what boredom feels like. A few app ideas surfaced — jotting them here, not building them until I am back.
$$, true, false, false, '2026-07-12 09:30:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111111',
    v_user_id, '2026-07-22', 'Back to rhythm', $$
First week back: lighter meetings helped. Inbox was manageable. Re-prioritized — payments demo polish before new features. Restarted deep-work blocks; body is sore from ignoring the gym during vacation.
$$, false, false, false, '2026-07-22 18:20:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111112',
    v_user_id, '2026-07-29', 'July lessons', $$
Vacation reset worked. Work: demo account needs believable seed data (meta). Personal: cooking twice a week saves money and stress. August experiment: one evening/week with zero screens after 8pm.
$$, true, false, false, '2026-07-29 19:10:00+00'
  ),
  (
    'd1111111-1111-4111-8111-111111111199',
    v_user_id, null, '', $$
Refactor demo seed script — June data should feel lived-in, not placeholder.
$$, false, false, true, '2026-06-22 09:00:00+00'
  );

  -- -------------------------------------------------------------------------
  -- Payments — May / June / July 2026
  -- -------------------------------------------------------------------------

  insert into public.mf_payments (
    id, user_id, title, amount, description, date, "group"
  ) values
  -- May 2026
  ('e1111111-1111-4111-8111-111111111101', v_user_id, 'Rent', 1650.00, 'May rent', '2026-05-01', 'home'),
  ('e1111111-1111-4111-8111-111111111102', v_user_id, 'Trader Joe''s', 78.40, 'Weekly shop', '2026-05-03', 'groceries'),
  ('e1111111-1111-4111-8111-111111111103', v_user_id, 'GitHub Copilot', 19.00, 'Monthly sub', '2026-05-12', 'personal'),
  ('e1111111-1111-4111-8111-111111111104', v_user_id, 'Coworking day pass', 28.00, 'Focus day downtown', '2026-05-18', 'extras'),
  ('e1111111-1111-4111-8111-111111111105', v_user_id, 'Mom''s birthday gift', 65.00, 'Books + card', '2026-05-26', 'giving'),

  -- June 2026
  ('e1111111-1111-4111-8111-111111111201', v_user_id, 'Rent', 1650.00, 'June rent', '2026-06-01', 'home'),
  ('e1111111-1111-4111-8111-111111111202', v_user_id, 'Spotify', 11.99, 'Family plan share', '2026-06-01', 'personal'),
  ('e1111111-1111-4111-8111-111111111203', v_user_id, 'Whole Foods', 92.15, 'Meal prep week', '2026-06-04', 'groceries'),
  ('e1111111-1111-4111-8111-111111111204', v_user_id, 'React meetup dinner', 34.50, 'After talk with speakers', '2026-06-08', 'extras'),
  ('e1111111-1111-4111-8111-111111111205', v_user_id, 'Gym membership', 45.00, 'Monthly', '2026-06-15', 'personal'),
  ('e1111111-1111-4111-8111-111111111206', v_user_id, 'Conference ticket', 89.00, 'Local React Summit', '2026-06-19', 'extras'),
  ('e1111111-1111-4111-8111-111111111207', v_user_id, 'Index fund', 500.00, 'Monthly auto-invest', '2026-06-22', 'investments'),
  ('e1111111-1111-4111-8111-111111111208', v_user_id, 'Farmers market', 41.20, 'Sat morning run + shop', '2026-06-27', 'groceries'),

  -- July 2026
  ('e1111111-1111-4111-8111-111111111301', v_user_id, 'Rent', 1650.00, 'July rent', '2026-07-01', 'home'),
  ('e1111111-1111-4111-8111-111111111302', v_user_id, 'Domain renewal', 18.00, 'mayachen.dev', '2026-07-01', 'personal'),
  ('e1111111-1111-4111-8111-111111111303', v_user_id, 'Cabin deposit', 420.00, 'Lake trip with Sam', '2026-07-05', 'extras'),
  ('e1111111-1111-4111-8111-111111111304', v_user_id, 'Groceries (stock up)', 88.30, 'Pre-vacation', '2026-07-10', 'groceries'),
  ('e1111111-1111-4111-8111-111111111305', v_user_id, 'Coffee catch-up', 12.50, 'Back-from-PTO with teammate', '2026-07-22', 'extras'),
  ('e1111111-1111-4111-8111-111111111306', v_user_id, 'Charity — food bank', 50.00, 'Monthly', '2026-07-25', 'giving'),
  ('e1111111-1111-4111-8111-111111111307', v_user_id, 'Brokerage', 500.00, 'Resume monthly invest', '2026-07-28', 'investments');

  raise notice 'Demo seed complete for % (user_id=%)', demo_email, v_user_id;
end $seed$;

-- Verification (optional — check row counts for the demo user only)
select
  u.email,
  (select count(*) from public.mf_notes n where n.user_id = u.id) as notes,
  (select count(*) from public.mf_task t where t.user_id = u.id) as activities,
  (select count(*) from public.mf_task_record r where r.user_id = u.id) as records,
  (select count(*) from public.mf_payments p where p.user_id = u.id) as payments
from auth.users u
where lower(u.email) = lower('demo@example.com');
