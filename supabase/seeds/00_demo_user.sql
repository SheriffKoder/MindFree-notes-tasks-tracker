-- Optional: create demo auth user (local `supabase db reset` only).
-- SKIP on hosted Supabase when the demo account already exists — use
-- 01_demo_maya_2026.sql instead (data only, no auth changes).

create extension if not exists pgcrypto;

do $$
declare
  demo_user_id uuid := 'a1111111-1111-4111-8111-111111111111';
  demo_email text := 'demo@example.com';
  demo_password text := 'password';
  existing_id uuid;
begin
  select id into existing_id
  from auth.users
  where lower(email) = lower(demo_email)
  limit 1;

  if existing_id is not null then
    demo_user_id := existing_id;
  elsif not exists (select 1 from auth.users where id = demo_user_id) then
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
      demo_user_id,
      'authenticated',
      'authenticated',
      demo_email,
      crypt(demo_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Maya Chen"}',
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
      demo_user_id,
      jsonb_build_object(
        'sub', demo_user_id::text,
        'email', demo_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      demo_user_id::text,
      now(),
      now(),
      now()
    );
  end if;

  update public.mf_profiles
  set display_name = 'Maya Chen',
      email = demo_email
  where id = demo_user_id;
end $$;
