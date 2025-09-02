# GH-Workflow-Issue-Creator

Create or update a GitHub issue whenever a workflow fails. Smart deduplication (stable fingerprint), category-aware templates, and AI-friendly formatting help humans and agents fix failures fast. Built with a 100% build-to-test philosophy and mature tooling (TypeScript, Vitest, ncc).

- Minimal runtime deps
- Mustache templates (no code execution)
- Works with `GITHUB_TOKEN` or fine‑grained PAT (for cross‑repo triage)
- Companion mode to auto‑close the canonical failure issue when a run turns green

## Quick start

```yaml
permissions:
  contents: read
  actions: read
  issues: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test

  issue-on-failure:
    needs: [build]
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - uses: your-org/GH-Workflow-Issue-Creator@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          category: general
          dedupe-strategy: fingerprint
```

### Close-on-success (companion mode)

```yaml
- uses: your-org/GH-Workflow-Issue-Creator@v1
  if: success()
  with:
    mode: close-on-success
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Cross‑repo triage

```yaml
- uses: your-org/GH-Workflow-Issue-Creator@v1
  with:
    auth-mode: pat
    github-token: ${{ secrets.FINE_GRAINED_PAT }}
    target-owner: your-org
    target-repo: central-triage
```

## Build & test

```bash
npm ci
npm test     # ✅ 100% coverage gate
npm run build
```

## Design goals

- Keep complexity low without compromising capability (KISS, not flimsy).
- Failures should produce one canonical issue per fingerprint. Updates > duplicates.
- Default templates are clear for humans and structured for agents.
- No unnecessary emojis or icons. Only: ✅ / ❌ where useful.

See `docs/CONFIGURATION_REFERENCE.md` for all inputs and outputs.
