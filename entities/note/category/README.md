# Note categories (`entities/note/category/`)

User-managed categories for **undated** and **quick** notes. Calendar notes keep `category_id` null.

This nest owns category CRUD, types, and read queries. Client hooks and API routes are added in later phases.

**Server import:** `@/entities/note/server` (re-exports from `category/server.ts`).
