import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export function SiteHeader() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchRef.current?.value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(232,230,220,0.9)] bg-[rgba(245,244,237,0.82)] backdrop-blur-xl">
      <div className="app-shell flex min-h-[72px] flex-wrap items-center justify-between gap-4 py-3">
        <div className="grid gap-1">
          <span className="text-[0.73rem] font-semibold uppercase tracking-[0.16em] text-[var(--terracotta)]">IB Physics</span>
          <span className="text-sm font-semibold text-[var(--near-black)]">Past-paper practice, restructured</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--stone-gray)]" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search…"
              aria-label="Search questions"
              className="focus-ring w-full max-w-[180px] rounded-full border border-[var(--border-cream)] bg-[rgba(250,249,245,0.92)] py-2.5 pl-9 pr-4 text-sm text-[var(--near-black)] placeholder-[var(--stone-gray)] shadow-[0_0_0_1px_rgba(232,230,220,0.55)] focus:max-w-[260px] focus:border-[var(--terracotta)] focus:shadow-[0_0_0_1px_rgba(201,100,66,0.28)]"
            />
          </form>
          <Link
            href="/#syllabus"
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-cream)] bg-[rgba(250,249,245,0.92)] px-4 py-2.5 text-sm font-semibold text-[var(--near-black)] shadow-[0_0_0_1px_rgba(232,230,220,0.55)] transition hover:-translate-y-0.5"
          >
            Browse syllabus
          </Link>
          <a
            href="https://github.com/michaelmjhhhh/fuck-you-physics"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source repository on GitHub"
            title="GitHub Repository"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-cream)] bg-[rgba(250,249,245,0.92)] text-[var(--near-black)] shadow-[0_0_0_1px_rgba(232,230,220,0.55)] transition hover:-translate-y-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.08 1.85 2.82 1.32 3.51 1.01.11-.78.42-1.32.76-1.62-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016.01 0c2.29-1.55 3.29-1.23 3.29-1.23.66 1.64.25 2.86.12 3.16.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
