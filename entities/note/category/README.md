# Note categories (`entities/note/category/`)

User-managed categories for **undated** and **quick** notes. Calendar notes keep `category_id` null.

This nest owns category CRUD, types, read queries, client fetchers/hooks, cache helpers, and the reusable manage-drawer form (`editor/`).

**Server import:** `@/entities/note/server` (re-exports from `category/server.ts`).  
**Client import:** `@/entities/note/client` (re-exports from `category/client.ts`).
