'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Fuse, { type FuseResult } from 'fuse.js';
import type { SearchIndexItem } from '@/lib/search-types';

function snippet(text: string, length = 180): string {
  const stripped = text.replace(/[*_`#\[\]]/g, '').replace(/\n+/g, ' ').trim();
  if (stripped.length <= length) return stripped;
  return stripped.slice(0, length).replace(/\s+\S*$/, '') + '…';
}

function SearchResultItem({ item }: { item: SearchIndexItem }) {
  const practiceUrl = `/practice/${item.practice_slug}`;

  return (
    <a
      href={practiceUrl}
      className="editorial-card grid gap-3 rounded-[18px] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(201,100,66,0.18),0_12px_32px_var(--shadow-soft)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex min-h-7 items-center rounded-full bg-[rgba(201,100,66,0.1)] px-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--terracotta)]">
          {item.topic_code}
        </span>
        <span className="text-[0.85rem] text-[var(--olive-gray)]">{item.sub_topic || item.topic}</span>
        <span className="ml-auto text-[0.8rem] text-[var(--stone-gray)]">
          {item.paper_month} {item.paper_year} · {item.paper_level}
        </span>
      </div>
      <p className="text-[0.97rem] leading-6 text-[var(--near-black)]">{snippet(item.content_markdown)}</p>
      <div className="flex items-center gap-2 text-[0.82rem] text-[var(--terracotta)]">
        <span>Open in practice →</span>
      </div>
    </a>
  );
}

interface SearchClientProps {
  initialQuery?: string;
}

export function SearchClient({ initialQuery = '' }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchIndexItem[] | null>(null);
  const [results, setResults] = useState<FuseResult<SearchIndexItem>[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((data: SearchIndexItem[]) => {
        setIndex(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!index) return;
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(index, {
      keys: [
        { name: 'content_markdown', weight: 1.0 },
        { name: 'sub_topic', weight: 0.6 },
        { name: 'topic', weight: 0.4 },
      ],
      includeScore: true,
      threshold: 0.35,
      minMatchCharLength: 2,
    });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const res = fuse.search(query);
      setResults(res.slice(0, 40));
    }, 280);
  }, [query, index]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('q', val);
    else params.delete('q');
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="app-shell py-10 pb-24">
      <div className="mb-8 grid gap-5">
        <div>
          <span className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[var(--terracotta)]">Search</span>
          <h1 className="mt-2 text-[clamp(2rem,4vw,3.4rem)] text-[var(--near-black)]">Find a question</h1>
          <p className="mt-2 max-w-[600px] text-[1rem] leading-7 text-[var(--olive-gray)]">
            Search across {index ? index.length : '…'} extracted past-paper questions.
          </p>
        </div>

        <div className="relative max-w-[640px]">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--stone-gray)]" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="search"
            value={query}
            onChange={handleInput}
            placeholder="Search questions… (e.g. torque, satellite, greenhouse)"
            autoFocus
            className="focus-ring w-full rounded-full border border-[var(--border-cream)] bg-[var(--ivory)] py-4 pl-12 pr-5 text-[1rem] text-[var(--near-black)] placeholder-[var(--stone-gray)] shadow-[0_0_0_1px_rgba(232,230,220,0.55)] focus:border-[var(--terracotta)] focus:shadow-[0_0_0_1px_rgba(201,100,66,0.28)]"
          />
        </div>
      </div>

      {loading && <p className="text-[var(--stone-gray)]">Loading index…</p>}

      {!loading && query && results.length === 0 && (
        <div className="grid gap-2 rounded-[22px] border border-[var(--border-cream)] bg-[rgba(250,249,245,0.72)] p-8 text-center">
          <p className="text-[1.1rem] font-semibold text-[var(--near-black)]">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-[var(--olive-gray)]">Try different keywords or check your spelling.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid gap-4">
          <p className="text-[0.88rem] text-[var(--stone-gray)]">{results.length} result{results.length === 1 ? '' : 's'}</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            {results.map((result) => (
              <SearchResultItem key={result.item.id} item={result.item} />
            ))}
          </div>
        </div>
      )}

      {!loading && !query && (
        <div className="grid gap-3">
          <p className="text-[0.9rem] text-[var(--stone-gray)]">Enter a search term to find questions across all topics.</p>
        </div>
      )}
    </div>
  );
}
