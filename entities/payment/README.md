# Payment entity (`entities/payment`)

Business logic for monthly payments. **One domain** — the Payments page and Home
quick-add are consumers, not forks.

## Start here

| Need | Go to |
| ---- | ----- |
| Fields / amount / group | [`docs/domain-model.md`](./docs/domain-model.md) |
| Month payload + cache keys | [`docs/read-models.md`](./docs/read-models.md) |
| Lazy create / autosave / delete | [`docs/writes-and-autosave.md`](./docs/writes-and-autosave.md) |
| Multi-tab / multi-device live sync | [`docs/realtime.md`](./docs/realtime.md) |
| Offline queue + flush on reconnect | [`docs/offline.md`](./docs/offline.md) |
| File lookup by responsibility | [`docs/responsibilities.md`](./docs/responsibilities.md) |

All WHY docs: [`docs/README.md`](./docs/README.md)

## Entry points

| File | Use in | Exports |
| ---- | ------ | ------- |
| `index.ts` | Any layer | Domain types, read-model types, pure month helpers |
| `server.ts` | Server Components, API routes | Reads, SSR hydrate, write use-cases, auth |
| `client.ts` | `"use client"` modules | TanStack keys, fetchers, read + mutation hooks, realtime, cache hub |
| `editor/` | Client form UI | Form types, `usePaymentForm`, `PaymentForm` |
| `offline/` | Offline mounts + orchestrator | Adapter, keys, flush helpers |

```text
model / schema / lib / transform / repository
        ↑
 queries/ + mutations/   →  server.ts  →  pages & API
 client/ + hooks/ + cache/ + offline/ →  client.ts / offline/  →  views & drawer
 editor/                  →  dumb form fields only
```

- Lower layers never import `queries/`, `hooks/`, or `client.ts`.
- API routes stay thin: auth → one `server.ts` export → JSON.
- Cross-slice consumers import from `index.ts` / `server.ts` / `client.ts` /
  `editor/` / `offline/` — never from segment implementation paths.

## Folder map

```text
entities/payment/
├── docs/         # WHY (domain, read models, writes, realtime, offline, responsibilities)
├── model/        # Types + month read-model payload
├── schema/       # Zod create/update contracts
├── lib/          # Pure helpers (month, totals)
├── transform/    # Row → domain mapping
├── repository/   # Supabase CRUD (RLS-scoped)
├── queries/      # Server read use-cases
├── mutations/    # Server write use-cases
├── cache/        # Pure month updaters + sync hub
├── client/       # TanStack keys + fetchers
├── hooks/        # Read query + write mutations + realtime
├── hydration/    # SSR month cache seed
├── offline/      # Offline queue adapter → sync hub
└── editor/       # Reusable payment form (no save routing)
```

## Editor vs drawer

```text
views/payments/model/use-payments-drawer   open/close, create-vs-edit intent
features/payments/payment-drawer           shell, resolve payment, save orchestrator
entities/payment/editor                    fields, validation, local dirty state
```

Autosave decision + orchestrator:
[`docs/writes-and-autosave.md`](./docs/writes-and-autosave.md).

## Consumers

| Consumer | Imports |
| -------- | ------- |
| `app/(app)/payments` hydrate | `server.ts` |
| `app/api/payments/*` | `server.ts` |
| `views/payments` (client) | `client.ts`, `offline/` |
| `views/home` (quick-add / sync islands) | `client.ts`, `offline/` |
| `features/payments/*` | `client.ts`, `editor/`, `index.ts`, `offline/` |
| Shared types / month helpers | `index.ts` |
