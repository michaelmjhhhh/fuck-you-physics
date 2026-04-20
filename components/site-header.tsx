import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(232,230,220,0.9)] bg-[rgba(245,244,237,0.82)] backdrop-blur-xl">
      <div className="app-shell flex min-h-[72px] flex-wrap items-center justify-between gap-5 py-3">
        <div className="grid gap-1">
          <span className="text-[0.73rem] font-semibold uppercase tracking-[0.16em] text-[var(--terracotta)]">IB Physics</span>
          <span className="text-sm font-semibold text-[var(--near-black)]">Past-paper practice, restructured</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/#syllabus"
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-cream)] bg-[rgba(250,249,245,0.92)] px-4 py-2.5 text-sm font-semibold text-[var(--near-black)] shadow-[0_0_0_1px_rgba(232,230,220,0.55)] transition hover:-translate-y-0.5"
          >
            Browse syllabus
          </Link>
        </div>
      </div>
    </header>
  );
}
