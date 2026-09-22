# CI docs

Repo-visible CI planning (what runs where). Workflow YAML lands in Item 2
under `.github/workflows/`.

| Path | Contents |
| ---- | -------- |
| [1-what-checks.md](./1-what-checks.md) | What checks we have today + where they can land |
| [2-before-yml.md](./2-before-yml.md) | Env secret/var, jobs, needs, caches — before workflow YAML |
| [../../.github/workflows/ci.yml](../../.github/workflows/ci.yml) | PR + Main workflow (`quality` ∥ `build` → `e2e`; lint deferred) |