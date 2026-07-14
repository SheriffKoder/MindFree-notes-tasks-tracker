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

The app currently does not use a separate profile table. Authentication is the only user system required for this phase.

### Decision

We use Supabase Auth as the source of truth for user accounts in the current phase.

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
9. Treat Supabase Auth users as the only required "users" data model for now. Do not introduce `public.profiles` until the app has real profile fields that need persistence.

### Why

This approach keeps auth state consistent across server rendering, route handlers, redirects, and protected routes.

It also matches the current code structure:

- `shared/lib/supabase/server.ts` creates the per-request SSR client
- `proxy.ts` refreshes the session and redirects guests or signed-in users
- `app/auth/confirm/route.ts` verifies email confirmation tokens
- `app/auth/callback/route.ts` exchanges OAuth codes for sessions

Using Supabase Auth directly avoids premature schema work while the app is still building its first authenticated flows.

### Consequences

Positive:

- user creation is available immediately through Supabase Auth
- email confirmation and Google OAuth are supported without custom auth infrastructure
- protected routes and server-side redirects stay centralized
- the app can ship without a custom user table

Trade-offs:

- Supabase dashboard configuration is required before real sign-ups work
- the confirm-signup email template must match the server-side confirmation route
- app-specific user data such as display name, avatar, onboarding state, or preferences will need a separate table later

### Operational Requirements

The Supabase project must be configured with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- URL allow list entries for `/auth/callback` and `/auth/confirm`
- email confirmation enabled
- Google provider enabled and configured
- an email template that passes `token_hash` and `type` into `/auth/confirm`

### Deferred Decisions

The following are intentionally deferred:

- adding `public.profiles`
- syncing auth users into app-specific tables
- role-based authorization
- password reset and account recovery flows
- MFA

### Follow-up

See [docs/setup/1-supabase-auth-dashboard-setup.md](../setup/1-supabase-auth-dashboard-setup.md) for the dashboard and provider setup checklist needed to make real users work.

Security layers: [docs/guides/security.md](../guides/security.md).
