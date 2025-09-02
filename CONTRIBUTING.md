# Contributing

Welcome! This project aims for a crisp DX and a strong test culture.

## Dev loop
- Node 18+
- `npm ci`
- `npm test` (coverage must remain 100%)
- `npm run build` to bundle

## Commit style
Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). We use release automation keyed off these.

## Tests
- Vitest runs with c8 coverage and a 100% threshold.
- If you touch logic, touch tests.
- Mock network/API in unit tests.

## PRs
- Include a brief problem statement and solution sketch.
- Keep PRs under ~500 LOC where possible.
- Add docs/examples when adding inputs or templates.
