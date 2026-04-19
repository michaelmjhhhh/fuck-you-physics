# Draft: Powerful Search Feature

## Requirements (confirmed)
- User request: "我想增加一个很牛逼的搜索功能" (wants a very powerful search capability).
- User preference: maximize search effort and be exhaustive (parallel explore + librarian + direct grep/rg/ast-grep).
- Primary direction chosen: **Global intelligent search** (cross-question-bank + cross-pages as unified entry point).
- Cost/ops constraint (new): user does **not** want extra server and does **not** want to pay.

## Technical Decisions
- Planning mode only: produce research-backed requirements and then a work plan (no implementation in this phase).
- Run broad parallel discovery first, then narrow with targeted questions.
- Candidate architecture (not finalized): global `/search` route + header launcher + API-backed retrieval with URL-param state.

## Research Findings
- Initial direct scan:
  - Search-like behavior/data hooks likely in `lib/questions.ts`, `lib/topics.ts`, `components/review-editor.tsx`, and dataset JSON under `prepared-questions/`.
  - No immediate `URLSearchParams` TypeScript pattern match from quick AST probe.
- Parallel background research launched (pending):
  - explore: current search/filter/query logic map
  - explore: question schema + searchable field analysis
  - explore: Next.js route/component insertion points for search UX
  - librarian: official Next.js App Router search patterns
  - librarian: fuzzy/semantic engine trade-off comparison (Fuse/MiniSearch/FTS5/Meili/Typesense/Algolia)
- Background research completed (key conclusions):
  - Current codebase has **no real search engine** yet; only file listing, in-memory filtering/sorting, and per-topic JSON loading.
  - Canonical searchable fields exist in `prepared-questions/*.json`: `content_markdown`, `options[].text`, `topic_code`, `sub_topic`, `paper.*`, `has_diagram`, `diagram_metadata`, `vibe_explanation`.
  - Existing loaders are centralized in `lib/questions.ts` (`listPreparedQuestionFiles`, `loadQuestionSet`) and topic grouping in `lib/topics.ts`.
  - Best insertion points for global search:
    - Header entry: `components/site-header.tsx`
    - Canonical route: `app/search/page.tsx`
    - Optional API: `app/api/search/route.ts`
    - Search service helper: `lib/search.ts`
  - Next.js App Router guidance favors URL query params (`/search?q=...`) as source of truth, debounced client input, and server-rendered initial results.
  - Engine trade-off signal:
    - Fuse/MiniSearch: fastest path, good typo tolerance, lighter feature depth.
    - SQLite FTS5: strong local baseline, low infra cost, weaker typo tolerance by default.
    - Meilisearch/Typesense: strongest “powerful search” UX (typo tolerance + facets + ranking) with extra infra.
    - Algolia: strongest managed option, highest recurring cost.

## Open Questions
- Search scope: syllabus list only vs practice questions vs review history vs global.
- Query type: keyword/fuzzy/semantic/filter facets/sorting.
- UX target: instant typeahead vs advanced search page.
- Performance target: dataset size + latency budget.
- Relevance objective still undecided: accuracy-first vs speed-first vs balanced.

## Questions Asked and Answers
- Q1: primary search surface priority (global vs practice-only vs syllabus-only vs review-only)
  - A: **Global intelligent search**.
- Q2: relevance priority and ranking policy (accuracy-first / speed-first / balanced)
  - A: **Accuracy-first**.
- Q3: infrastructure preference for high-accuracy search backend
  - A: **Option 1 selected (Meilisearch/Typesense class)**, with deployment clarification requested.

## Deployment Clarification (pending)
- User question: If using option 1, can frontend remain Vercel-only, or must backend be deployed separately?
- Pending decision: managed search SaaS vs self-hosted search service.

## Deployment Decisions
- Frontend hosting remains on **Vercel**.
- Search backend mode chosen: **Managed search SaaS**.
- Provider chosen: **Meilisearch Cloud**.

## Decision Reconsideration Triggered
- User asks what Meilisearch is and explicitly states "不想花钱" and likely "不想要额外服务器".
- Deployment choice must be revisited toward zero-cost / no-extra-server architecture.
- User pivoted: may pause search feature and optimize other functionality first.

## Status Update
- Search planning is currently on hold pending new optimization target selection.

## Questions Asked and Answers
- Q4: How to implement managed hosted search service concretely
  - A: User requested step-by-step operational workflow.
- Q5: managed provider selection
  - A: **Meilisearch Cloud**.

## Open Questions
- MVP scope details still pending:
  - Which searchable surfaces are in phase-1 (question body/options only vs include review history and syllabus text).
  - Which filters are mandatory in phase-1 (topic/year/level/has_diagram/etc).
  - Result ranking tie-breakers after relevance.
- Test strategy decision pending (TDD / tests-after / no-automated-tests; agent QA remains mandatory).
- Backend final choice pending under new constraints: `no extra server + no recurring cost`.

## Scope Boundaries
- INCLUDE: discovery of current search-related patterns, data sources, constraints, and feasible architecture options.
- EXCLUDE: implementation changes during interview/planning phase.
