# Architecture

App-wide shape of MindFree — rendering, state ownership, caching, data flow, routing.

| Doc | Topic |
| --- | ----- |
| [rendering.md](./rendering.md) | RSC-first, client islands, hydration |
| [state-management.md](./state-management.md) | URL vs server vs ephemeral UI state |
| [caching.md](./caching.md) | TanStack Query, SSR hydrate, read models |
| [data-flow.md](./data-flow.md) | API → use-case → repository |
| [routing.md](./routing.md) | App Router, month/view params, auth gates |
| [user-session-and-preferences.md](./user-session-and-preferences.md) | Session-only identity (no UserContext); prefs + theme apply app-wide |
| [demo-default-month.md](./demo-default-month.md) | Demo account fixed `?month=` fallback (`DEMO_DEFAULT_MONTH`) |
| [app-lock.md](./app-lock.md) | App lock gate, unlock cookie, distinct from Auth password |

**Decisions (ADRs):** [docs/adr/README.md](../adr/README.md)  
**Security:** [docs/guides/security.md](../guides/security.md)  
**Clone setup:** [docs/setup/0-quick-setup.md](../setup/0-quick-setup.md)
