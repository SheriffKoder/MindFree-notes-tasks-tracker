# MindFree

**Live app:** [mind-free-notes-tasks-tracker.vercel.app](https://mind-free-notes-tasks-tracker.vercel.app)

**A calm personal hub for your month** — journal on a calendar, track habits with real goals, set reminders, log payments, and see progress over time. Mobile-first web app built with Next.js, React, and Supabase.

![MindFree home — quick note, starred notes, and today's tasks](docs/assets/mindfree-home.png)

---

## What is MindFree?

Most productivity apps give you a checkbox list and stop there. MindFree is built around how a month actually flows: you write some days, build habits on a schedule, remember appointments, and keep an eye on money — without opening four different apps.

**Home** is the landing page: a quick note, starred notes, today's tasks and reminders, and a fast way to log a payment. Dedicated pages go deeper when you need a calendar, a full list, or analytics.

The UX is meant to feel calm — inspired by Notion and Material Design 3 — while the engineering underneath is production-grade: live sync, offline writes, autosave, and row-level security.

---

## Questions this app answers

| Question | Answer |
| -------- | ------ |
| I want a **quick note on the go** | Home quick slot — one scratchpad per user, always visible |
| I want to **journal on a calendar** | Calendar view on `/notes` — one entry per day, open in the drawer |
| I have a **project** to write about | General notes — undated, long-form, on the Notes page |
| Can Home be **easy access** to specific notes? | Star notes → they appear in the Home starred strip |
| Some days are **important** | Flag as important → dark red border on that calendar day |
| I want to **build habits**, not just check boxes | Tasks with scheduling, count/duration tracking, and daily or period goals |
| What should I do **today**? | Home shows today's tasks and reminders — record inline without opening another page |
| How am I **doing over the month**? | `/progress` — weekly and monthly stats derived from what you actually logged |
| I need to **remember something** on a date | Reminders — one-off or recurring nudges on `/reminders` and Home |
| I want to **track payments** for the month | `/payments` — log expenses/income, group entries, browse by week |
| Phone and laptop **without refreshing**? | Live sync via Supabase Realtime into shared TanStack caches |
| Two tabs on **different pages**? | Same caches + Realtime; offline tabs merge when you reconnect |
| I went **offline** — is my edit saved? | Per-user browser queue; flushes when you're back online |
| Will the **database stay clean**? | Empty calendar notes auto-delete; general notes stay until you delete them |
| Can someone **try it** without signing up? | Demo login with pre-loaded sample data (June 2026) |
| Extra **privacy** on a shared device? | App lock — a second password after login (Profile) |

---

## Features

### Notes

Write in three ways, all from one notes system:

- **Calendar notes** — one journal entry per day; browse by month grid or list on `/notes`
- **General notes** — undated project docs and long-form writing
- **Quick note** — a always-visible scratchpad on Home

Star notes to pin them on Home. Mark a calendar day as **important** for visual emphasis. Everything autosaves in a shared drawer — no Save button.

### Tasks

Recurring habits and goals with real tracking, not just checkboxes:

- **Scheduling** — daily, weekly, monthly, yearly, or one-off
- **Tracking modes** — done/not done, count ("8 glasses"), duration ("30 min"), or both
- **Goals** — per-day targets and week/month period goals
- **Presentation** — colors, priorities; grouped on Home (High → Medium → Low)

View tasks on a calendar or list at `/tasks`, or record today's work inline on Home.

### Progress

Analytics derived from what you actually logged — not a separate "progress" table.

`/progress` compares done vs expected for each task across weeks and months: completion rates, period goals, and breakdowns that reflect your schedule and tracking mode.

### Reminders

A lightweight sibling of tasks — same engine, simpler surface. One-off or scheduled nudges (appointments, bills, deadlines). No colors or complex goal metrics. Due today on Home; full list at `/reminders`.

### Payments

Month-scoped expense and income logging. Group entries, browse by week, navigate months the same way as notes and tasks. Quick-add from Home or the full ledger at `/payments`.

### Profile

Account display name, theme (light / dark / custom accent), **app lock** (a second password after login), and Excel data export. Not available on the shared demo account.

---

## Try the demo

Enable demo login in `.env` (see [`.env.example`](.env.example)):

```env
ENABLE_DEMO_LOGIN=true
DEMO_LOGIN_EMAIL=demo@example.com
DEMO_LOGIN_PASSWORD=DemoPass123!
DEMO_DEFAULT_MONTH=2026-06
DEMO_DEFAULT_TODAY=2026-06-15
```

Click **Try demo** on the login page. The demo lands on **June 2026** with pre-loaded sample data (notes, tasks, reminders, payments). Home Today uses `DEMO_DEFAULT_TODAY` (defaults to mid-month). Profile is hidden for that account.

To load sample data on hosted Supabase, run [`supabase/seeds/01_demo_maya_2026.sql`](supabase/seeds/01_demo_maya_2026.sql) in the SQL Editor. Details: [shared/lib/auth/README.md — Demo login](shared/lib/auth/README.md#demo-login-env-gated).

---

## Under the hood

MindFree is a real product codebase, not a tutorial CRUD app.

| Concern | Approach |
| -------- | -------- |
| **Architecture** | Feature-Sliced Design — `views → features → entities → shared`. Read: [Entity / feature / view structure](docs/adr/0002-entity-feature-view-structure.md) |
| **Rendering** | RSC-first with client islands; SSR prefetch + TanStack Query hydration. Read: [Rendering: server vs client split](docs/architecture/rendering.md) · [RSC-first pages with TanStack Query hydration](docs/adr/0003-rsc-first-with-query-hydration.md) · [Caching: TanStack Query after SSR hydrate](docs/architecture/caching.md) |
| **State** | URL-owned app state (`?month=`, `?view=`); server data in TanStack Query caches. Read: [State management: URL vs server vs UI](docs/architecture/state-management.md) · [URL-owned application state (`month`, `view`)](docs/adr/0004-url-owned-application-state.md) |
| **Realtime sync** | Supabase `postgres_changes` patches shared caches across tabs and devices. Read: [Realtime: live sync across tabs and devices](entities/note/docs/realtime.md) · [Realtime via Supabase `postgres_changes`](docs/adr/0008-realtime-postgres-changes.md) |
| **Offline writes** | Per-user browser queue; flush on reconnect. Read: [Offline queue: per-user pending writes](shared/offline-queue/README.md) · [Simple offline writes (per-user queue)](docs/adr/0009-offline-writes-simple-queue.md) |
| **Autosave** | Debounced writes; no Save button. Read: [Writes and autosave](entities/note/docs/writes-and-autosave.md) · [Pre-save orchestrator as save interceptor](docs/adr/0006-pre-save-orchestrator.md) |
| **Optimistic UI** | Immediate cache patches before the server confirms. Read: [Optimistic updates (and form snap)](entities/note/docs/optimistic-updates.md) |
| **Cache sync hubs** | One place per domain to apply create/update/delete to all read models. Read: [Synchronize note caches hub](docs/adr/0007-synchronize-note-caches-hub.md) |
| **Security** | Supabase Auth + RLS on every user-owned table; app lock as a second gate. Read: [Security: auth gates, RLS, demo account](docs/guides/security.md) · [Supabase Auth Architecture](docs/adr/0001-auth-architecture.md) · [App lock: second gate after login](docs/architecture/app-lock.md) |
| **Activity model** | One `mf_task` table backs both tasks and reminders. Read: [One activity model, two kinds (tasks + reminders)](docs/adr/0011-one-activity-model-two-kinds.md) · [Activity domain model](entities/activity/docs/domain-model.md) |

**Stack:** Next.js 16 · React 19 · TypeScript · Supabase (Auth, Postgres, Realtime) · TanStack Query · Tailwind CSS

### Documentation

| Start here | Contents |
| ---------- | -------- |
| [docs/README.md](docs/README.md) | Reading order and doc index |
| [docs/setup/0-quick-setup.md](docs/setup/0-quick-setup.md) | Clone → env → Supabase → run |
| [docs/architecture/README.md](docs/architecture/README.md) | Rendering, caching, routing, data flow |
| [docs/adr/README.md](docs/adr/README.md) | Architecture Decision Records |
| [docs/concepts/glossary.md](docs/concepts/glossary.md) | Product vocabulary (note kinds, flags, read models) |
| [docs/guides/security.md](docs/guides/security.md) | Auth gates, RLS, demo account |

**Domain docs:** [Notes](entities/note/docs/README.md) · [Activity (tasks & reminders)](entities/activity/docs/README.md) · [Payments](entities/payment/docs/README.md) · [Profile](entities/profile/docs/README.md)

---

## Run it on your computer

**You need:** Node.js, a free [Supabase](https://supabase.com) project, and about 15 minutes the first time.

### 1. Clone and install

```bash
git clone <repo-url>
cd notes-tasks-app
npm install
```

### 2. Create a Supabase project

1. Go to [app.supabase.com](https://app.supabase.com) and create a project.
2. Open **Project Settings → API** and copy:
   - **Project URL**
   - **Publishable** key (or legacy `anon` key)

### 3. Add environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

Do **not** put the `service_role` secret in a `NEXT_PUBLIC_` variable.

### 4. Configure Auth in Supabase

The dashboard needs redirect URLs and email confirmation before sign-up works.

Follow the checklist: **[docs/setup/1-supabase-auth-dashboard-setup.md](docs/setup/1-supabase-auth-dashboard-setup.md)**

At minimum: set **Site URL** to `http://localhost:3000`, add redirect URLs for `/auth/confirm` and `/auth/callback`, and enable the email provider.

### 5. Apply database migrations

**Option A — Supabase CLI (recommended)**

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

**Option B — SQL Editor (no CLI)**

Open **SQL Editor** in the Supabase dashboard and run each file in [`supabase/migrations/`](supabase/migrations/) in order.

Full details and verification queries: **[docs/setup/0-quick-setup.md](docs/setup/0-quick-setup.md)**

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, confirm your email, and explore.

### Smoke test

| Step | Check |
| ---- | ----- |
| 1 | Sign up at `/signup` and confirm email |
| 2 | Sign in at `/login` |
| 3 | Home, Notes, Tasks, and Payments load |
| 4 | Sign out returns to `/login` |

---

## Project layout (high level)

```text
src/
├── app/          # Next.js routes (thin shells)
├── views/        # Page composition (Home, Notes, Tasks, …)
├── features/     # Reusable workflows (auth, drawers, profile sections)
├── entities/     # Domain logic (note, activity, payment, profile)
├── widgets/      # Composed UI sections
└── shared/       # Cross-cutting infra (month navigator, offline queue, theme)
```

Dependency direction: `views → features → entities → shared`.

---

## License

See repository license file if present.
