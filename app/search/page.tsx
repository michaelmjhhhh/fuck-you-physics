import { Suspense } from 'react';
import { SearchClient } from '@/components/search-client';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;

  return (
    <Suspense fallback={<div className="app-shell py-14 text-[var(--olive-gray)]">Loading search…</div>}>
      <SearchClient initialQuery={q} />
    </Suspense>
  );
}
