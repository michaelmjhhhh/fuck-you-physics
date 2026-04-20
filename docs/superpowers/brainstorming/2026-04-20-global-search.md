# Brainstorming: Global Question Search

**Date:** 2026-04-20
**Branch:** feat/search-global-questions

## Context

Need to add a global search feature to fuck-you-physics website that allows users to search across all extracted IB Physics questions.

## Existing Project Context

- Next.js + TypeScript frontend in `app/` directory
- Data sources: `prepared-questions/*.json` (11 topic JSON files) and `ib_physics.db` (SQLite)
- Topics: A4, B1, B2, B3, B4, B5, C1, C2, C4, C5, D1
- Question format: `QuestionRecord` with `content_markdown`, `topic_code`, `source_image_path`, etc.
- Existing routes: `/practice/[topic]` for topic-specific practice
- SiteHeader component at top of every page

## User Requirements (already decided - do NOT question)

### UX Spec
1. Search bar in site header (always visible)
2. `/search?q=<query>` page
3. Client-side fuzzy search with fuse.js
4. Results: question snippet + topic badge + image thumbnail
5. Click result → navigate to `/practice/[topic]` page
6. Search all topics: A4, B1, B2, B3, B4, B5, C1, C2, C4, C5, D1
7. Data sources: prepared-questions/*.json and ib_physics.db

## Design Decision

Since the UX spec is already defined, the design is essentially:
- Header search bar (client component) → navigates to `/search?q=...`
- `/search` page with fuse.js client-side fuzzy search
- Loads all question JSON files at build time or client-side
- Displays results with snippet, topic badge, and image thumbnail
- Click navigates to `/practice/[topic]`

## No Visual Companion Needed

The UX spec is text-based and fully specified. No need for visual mockups.

## Questions to Explore

N/A - User spec is complete.

## Approaches Considered

N/A - User spec is complete and prescriptive.

## Conclusion

Proceed directly to writing implementation plan.