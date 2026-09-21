-- Dedicated auth users for Home tenant-isolation tests.
-- Idempotent: safe to re-run. Creates A/B accounts only if missing.
-- Profiles / live Diary rows may be auto-seeded by existing auth.users
-- triggers; that does not write into mf_testing_*.

create extension if not exists pgcrypto;

do $$
declare
  user_a_id uuid := 'a2222222-2222-4222-8222-222222222222';
  user_a_email text := 'isolation-a@example.com';
  user_b_id uuid := 'b3333333-3333-4333-8333-333333333333';
  user_b_email text := 'isolation-b@example.com';
  shared_password text := 'IsolationPass123!';
begin
  -- User A ---------------------------------------------------------------
  if not exists (
    select 1 from auth.users
    where id = user_a_id or lower(email) = lower(user_a_email)
  ) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      user_a_id,
      'authenticated',
      'authenticated',
      user_a_email,
      extensions.crypt(shared_password, extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Isolation User A"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      user_a_id,
      jsonb_build_object(
        'sub', user_a_id::text,
        'email', user_a_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      user_a_id::text,
      now(),
      now(),
      now()
    );
  end if;

  -- User B ---------------------------------------------------------------
  if not exists (
    select 1 from auth.users
    where id = user_b_id or lower(email) = lower(user_b_email)
  ) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      user_b_id,
      'authenticated',
      'authenticated',
      user_b_email,
      extensions.crypt(shared_password, extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Isolation User B"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      user_b_id,
      jsonb_build_object(
        'sub', user_b_id::text,
        'email', user_b_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      user_b_id::text,
      now(),
      now(),
      now()
    );
  end if;
end $$;
