import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="app-shell grid min-h-[60vh] place-items-center py-20">
      <div className="editorial-card grid max-w-xl gap-4 rounded-[24px] p-8 text-center">
        <h1 className="text-4xl text-[var(--near-black)]">Topic not found</h1>
        <p className="text-[var(--olive-gray)]">That route does not map to a currently extracted practice topic.</p>
        <div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,var(--terracotta)_0%,var(--terracotta-deep)_100%)] px-5 py-3 text-sm font-semibold text-[var(--ivory)] shadow-[0_10px_24px_rgba(201,100,66,0.22)] transition hover:-translate-y-0.5"
          >
            Return to syllabus
          </Link>
        </div>
      </div>
    </main>
  );
}
