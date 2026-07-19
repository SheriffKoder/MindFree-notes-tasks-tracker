# Codebase terminology

Short definitions for folder and layer names used across MindFree. Product terms live in [glossary.md](./glossary.md).

| Term | Meaning |
| ---- | ------- |
| **`app/`** | Next.js routes, layouts, thin API handlers — not business rules |
| **`views/`** | Page composition for one route (wire features + entity hooks) |
| **`features/`** | Reusable product workflows (e.g. note drawer island) |
| **`entities/`** | One folder per domain concept (note, later task…) |
| **`shared/`** | Cross-domain infra with no product rules |
| **`server.ts`** | Entity barrel for RSC / API / actions only |
| **`client.ts`** | Entity barrel for `"use client"` — hooks, fetchers |
| **`queries/`** | Server read use-cases |
| **`mutations/`** | Server write use-cases |
| **`client/`** | Client fetchers, query keys/options, and prefetch helpers |
| **`hooks/`** | React query, mutation, and synchronization hooks |
| **`cache/`** | Pure cache transforms and cache synchronization |
| **`hydration/`** | SSR cache seeders; the caller owns dehydration |
| **`repository/`** | Supabase (or DB) access, always `user_id`-aware |
| **`transform/`** | Pure reshape (rows → calendar days, etc.) |
| **Read model** | API/cache shape for one consumer question (calendar month, home strip…) |
| **Client island** | `"use client"` subtree with local interactivity |
| **Hydration** | Seeding TanStack from SSR so client `useQuery` starts warm |
| **ADR** | Architecture Decision Record under `docs/adr/` |

Responsibility-group names describe current boundaries; they are extensible,
not a locked vocabulary.

**Folder rules:** [`.cursor/rules/project-structure.mdc`](../../.cursor/rules/project-structure.mdc)
**Doc layout:** `app/development/workflow/documentation/doc-structure.md`
