import Link from 'next/link';
import type { TopicMeta } from '@/lib/types';

export function TopicCard({ topic }: { topic: TopicMeta }) {
  return (
    <Link
      href={`/practice/${topic.slug}`}
      className="editorial-card focus-ring group grid min-h-[238px] gap-4 rounded-lg p-5 transition hover:border-[var(--accent-muted)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-2">
          <span className="inline-flex min-h-8 w-fit items-center rounded-md bg-[var(--accent-soft)] px-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--accent-deep)]">
            {topic.topicCode}
          </span>
          <span className="inline-flex min-h-8 w-fit items-center rounded-md bg-[var(--success-soft)] px-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--success)]">
            Live now
          </span>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--warm-sand)] text-lg text-[var(--near-black)] transition group-hover:translate-x-0.5">
          →
        </span>
      </div>

      <div className="grid gap-2">
        <h3 className="text-[1.42rem] leading-tight text-[var(--near-black)]">{topic.displayName}</h3>
        <p className="text-[0.98rem] leading-7 text-[var(--olive-gray)]">{topic.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 text-[0.94rem] text-[var(--olive-gray)]">
        <span className="font-semibold text-[var(--near-black)]">{topic.questionCount} extracted questions</span>
        <span className="rounded-full bg-[rgba(201,100,66,0.09)] px-3 py-1 text-[0.8rem] font-medium text-[var(--terracotta-deep)]">Image-backed</span>
      </div>
    </Link>
  );
}
