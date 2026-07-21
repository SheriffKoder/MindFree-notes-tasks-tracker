## ADR 0001: Supabase Auth Architecture

### Status

Accepted

### Context

MindFree needs a production-ready authentication foundation in the Next.js App Router. The app already includes:

- public auth entry pages at `/login` and `/signup`
- server-side email confirmation at `/auth/confirm`
- server-side OAuth code exchange at `/auth/callback`
- route protection through `proxy.ts`
- email/password sign-in and sign-up
- Google OAuth sign-in
- logout support and auth fallback notices

When this ADR was accepted, authentication was the only user system required. App-owned profile tables were intentionally deferred.

### Decision

We use Supabase Auth as the source of truth for **identity** (who is signed in).

The architecture is:

1. Use `@supabase/ssr` for all auth-aware access in the App Router.
2. Keep three Supabase entry points:
   - browser client for client-side interactions
   - server client for server actions, route handlers, and server components
   - proxy session updater for cookie refresh inside `proxy.ts`
3. Keep `/login`, `/signup`, `/auth/callback`, and `/auth/confirm` public.
4. Protect the rest of the app by default with `proxy.ts`.
5. Use email/password and Google OAuth as the initial sign-in methods.
6. Complete email confirmation on the server with `verifyOtp` in `app/auth/confirm/route.ts`.
7. Complete OAuth on the server with `exchangeCodeForSession` in `app/auth/callback/route.ts`.
8. Keep the protected app entry route at `/`.
9. Resolve identity from the Auth session on demand (`getUser()` / helpers). Do **not** introduce a React `UserContext` / `AuthProvider` — there is no in-app user object store.

### Why

This approach keeps auth state consistent across server rendering, route handlers, redirects, and protected routes.

It also matches the current code structure:

- `shared/lib/supabase/server.ts` creates the per-request SSR client
- `proxy.ts` refreshes the session and redirects guests or signed-in users
- `app/auth/confirm/route.ts` verifies email confirmation tokens
- `app/auth/callback/route.ts` exchanges OAuth codes for sessions

Using Supabase Auth keeps identity consistent across server rendering, route handlers, redirects, and protected routes without a custom auth stack.

### Consequences

Positive:

- user creation is available immediately through Supabase Auth
- email confirmation and Google OAuth are supported without custom auth infrastructure
- protected routes and server-side redirects stay centralized
- identity stays session-based (no global React user store)

Trade-offs:

- Supabase dashboard configuration is required before real sign-ups work
- the confirm-signup email template must match the server-side confirmation route
- each server boundary re-resolves the session when it needs `user.id` / email

### Operational Requirements

The Supabase project must be configured with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- URL allow list entries for `/auth/callback` and `/auth/confirm`
- email confirmation enabled
- Google provider enabled and configured
- an email template that passes `token_hash` and `type` into `/auth/confirm`

### Deferred Decisions

The following remain deferred:

- role-based authorization
- password reset and account recovery flows
- MFA
- avatars / rich onboarding metadata beyond current Profile fields

### Follow-up (profile tables introduced later)

App-owned profile data now lives in `mf_profiles`, `mf_user_preferences`, and `mf_user_security_settings` (migration `006_profile.sql`), keyed by `auth.users.id` with RLS. Auth remains the identity source of truth; profile rows are settings and account display data, not a second auth system.

See:

- [user-session-and-preferences.md](../architecture/user-session-and-preferences.md)
- [app-lock.md](../architecture/app-lock.md)
- [docs/setup/1-supabase-auth-dashboard-setup.md](../setup/1-supabase-auth-dashboard-setup.md)
- [docs/guides/security.md](../guides/security.md)
