## Supabase Auth Dashboard Setup

This follow-up captures the dashboard and provider configuration required to make real users work in MindFree.

### Goal

Configure the hosted Supabase project so the existing app code can:

- create email/password users
- send confirmation emails
- verify those confirmations through `/auth/confirm`
- start Google OAuth
- finish Google OAuth through `/auth/callback`
- list created users in Supabase Auth

### Current App Expectations

The code currently expects:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- email confirmation redirect to `/auth/confirm`
- Google OAuth redirect to `/auth/callback`

Relevant files:

- `features/auth/signup/model/signup-action.ts`
- `features/auth/google-sign-in/model/google-sign-in-action.ts`
- `app/auth/confirm/route.ts`
- `app/auth/callback/route.ts`

### 1. Add Environment Values

In the app environment, set:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Use the project URL and the public publishable key from Supabase project settings.

Do not place the `service_role` key in browser-facing app environment variables.

### 2. Configure URL Settings in Supabase

In Supabase Dashboard, go to `Authentication > URL Configuration`.

Set:

- `Site URL`
  - local development: `http://localhost:3000`
  - production: your real deployed app URL

Add redirect URLs for local development:

- `http://localhost:3000/auth/confirm`
- `http://localhost:3000/auth/callback`

Or use a broader local pattern:

- `http://localhost:3000/**`

For production, add exact app URLs for:

- `/auth/confirm`
- `/auth/callback`

If using Vercel previews, also allow preview URLs as needed.

### 3. Enable Email Sign-up and Email Confirmation

In `Authentication > Providers > Email`:

- enable email auth
- allow new users to sign up
- enable confirm email

This is required because the signup flow currently assumes the user must confirm their email before the app treats the account as active.

### 4. Update the Confirm Signup Email Template

This app uses a server-side confirmation route that expects `token_hash` and `type` in the request URL.

In `Authentication > Email Templates`, update the confirm-signup link to point at the app route with those values.

Recommended template link:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
  Confirm email address
</a>
```

If you want to preserve a post-confirmation app destination:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email&next=/">
  Confirm email address
</a>
```

Important:

- use `{{ .RedirectTo }}` because the app passes `emailRedirectTo`
- do not append `/auth/confirm` inside the template if `emailRedirectTo` already points there

### 5. Enable Google Provider in Supabase

In `Authentication > Providers > Google`:

- enable Google sign-in
- paste the Google Client ID
- paste the Google Client Secret

Supabase will show you the callback URL that Google must redirect back to.

### 6. Configure Google Cloud OAuth

In Google Cloud Console:

1. Create an OAuth client of type `Web application`.
2. Add your app URLs to `Authorized JavaScript origins`.
3. Add the Supabase callback URL from the Google provider page to `Authorized redirect URIs`.

Important distinction:

- Google Cloud redirect URI points to Supabase
- Supabase redirect URL allow list points back to your app

### 7. Where Users Will Appear

Once signup works, users will appear in:

- `Authentication > Users` in the Supabase dashboard

They also exist in the `auth.users` table.

Example verification query:

```sql
select id, email, created_at, email_confirmed_at
from auth.users
order by created_at desc;
```

### 8. Manual Verification Checklist

After the dashboard configuration is complete, verify:

1. Sign up with email/password from `/signup`.
2. Confirm a new user appears in `Authentication > Users`.
3. Confirm the email arrives.
4. Click the confirmation link.
5. Confirm `app/auth/confirm/route.ts` completes successfully and lands back in the app.
6. Start Google sign-in from `/login` or `/signup`.
7. Confirm Google returns through `/auth/callback`.
8. Confirm a user session is created.
9. Refresh the page and confirm the session persists.
10. Sign out and confirm protected routes redirect back to `/login`.

### 9. Current Scope Boundary

Supabase Auth remains the identity source of truth (who is signed in). Apply migrations so app-owned profile rows exist — especially `supabase/migrations/006_profile.sql`, which creates:

- `mf_profiles` — display name + email copy
- `mf_user_preferences` — theme, accent, export email, …
- `mf_user_security_settings` — app lock flag + password hash

Those tables are seeded on signup (DB trigger) and/or lazily on first profile read. They are not a replacement for Auth; they store settings keyed by `auth.users.id`. See [user-session-and-preferences.md](../architecture/user-session-and-preferences.md).
