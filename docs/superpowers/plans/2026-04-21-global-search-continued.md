# Global Search — Continuation Plan (2026-04-21)

## Status
OpenCode ran on 2026-04-20 and implemented the search UI and index builder. Task was interrupted before final commit.

## Completed by OpenCode
- `lib/search-types.ts` — SearchIndexItem type
- `lib/search-index.ts` — search index builder
- `lib/__tests__/search-types.test.ts` + `lib/__tests__/search.test.ts`
- `components/search-client.tsx` — full search UI with Fuse.js
- `app/search/page.tsx` — /search?q=<query> page
- `public/search-index.json` — pre-built search index (415KB)
- `scripts/build-search-index.js` — index build script
- `package.json` + `pnpm-lock.yaml` — Fuse.js dependency added

## Completed by Hermes
- `components/site-header.tsx` — added search bar with form submit

## Remaining
- Commit all changes on `feat/search-global-questions`
- Open PR targeting `main`
