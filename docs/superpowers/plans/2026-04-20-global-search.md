# Implementation Plan: Global Question Search

## Step 1: Install fuse.js
```bash
npm install fuse.js
```

## Step 2: Create search index builder (`lib/search-index.ts`)
- Function `buildSearchIndex()` that:
  - Loads all question JSON files from `prepared-questions/`
  - Extracts: id, topic, topic_slug, topic_code, content_markdown, sub_topic, source_image_path
  - Returns typed array `SearchIndexItem[]`
- Function `getSearchIndexPath()` → returns path to static index JSON

## Step 3: Create search types (`lib/search-types.ts`)
```typescript
export type SearchIndexItem = {
  id: string;
  topic: string;
  topic_slug: string;
  topic_code: string;
  content_markdown: string;
  sub_topic: string;
  source_image_path: string | null;
};

export type SearchResult = {
  item: SearchIndexItem;
  score: number;
  matches?: readonly FuseResultMatch[];
};
```

## Step 4: Create search page (`app/search/page.tsx`)
- Server component
- Reads `?q=` searchParams
- Renders `<SearchClient query={query} />`

## Step 5: Create SearchClient component (`components/search-client.tsx`)
- Client component (`'use client'`)
- Loads search index on mount (fetch from `/search-index.json`)
- Initializes Fuse.js with options:
  - `keys`: `[{name: 'content_markdown', weight: 1.0}, {name: 'sub_topic', weight: 0.5}, {name: 'topic', weight: 0.3}]`
  - `includeScore: true`
  - `threshold: 0.3` (adjustable)
- Debounced search (300ms)
- Renders results list with:
  - Question snippet (first 150 chars of content_markdown)
  - Topic badge (topic_code + topic name)
  - Image thumbnail (source_image_path)
- Click → router.push(`/practice/${item.topic_slug}`)

## Step 6: Create public search index JSON
- Run build script to generate `/public/search-index.json`
- Or generate on-demand and cache

## Step 7: Add search bar to header (`components/site-header.tsx`)
- Add search input with icon
- Keyboard shortcut: `/` focuses search
- Form action: `/search?q=...`
- Styled per design system

## Step 8: Add test file (`lib/__tests__/search.test.ts`)
- Test `buildSearchIndex()` function
- Test search returns relevant results
- Test edge cases (empty query, no results)

## Step 9: Build and verify
```bash
npm run build
npm test
```

## Step 10: Commit with prefix `feat(search):`

## File Changes Summary
| File | Action |
|------|--------|
| `package.json` | Add fuse.js |
| `lib/search-types.ts` | New - types for search |
| `lib/search-index.ts` | New - index builder |
| `public/search-index.json` | Generated - pre-built index |
| `app/search/page.tsx` | New - search route |
| `components/search-client.tsx` | New - search UI |
| `components/site-header.tsx` | Modify - add search bar |
| `lib/__tests__/search.test.ts` | New - tests |