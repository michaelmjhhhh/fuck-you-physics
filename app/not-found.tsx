import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="app-shell grid min-h-[60vh] place-items-center py-20">
      <div className="editorial-card grid max-w-xl gap-4 rounded-lg p-8 text-center">
        <h1 className="text-4xl text-[var(--near-black)]">Topic not found</h1>
        <p className="text-[var(--olive-gray)]">That route does not map to a currently extracted practice topic.</p>
        <div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--ivory)] transition hover:bg-[var(--accent-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-blue)]"
          >
            Return to syllabus
          </Link>
        </div>
      </div>
    </main>
  );
}
