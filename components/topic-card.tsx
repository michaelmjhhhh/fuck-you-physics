import Link from 'next/link';
import type { TopicMeta } from '@/lib/types';

export function TopicCard({ topic }: { topic: TopicMeta }) {
  return (
    <Link
      href={`/practice/${topic.slug}`}
      className="editorial-card group grid min-h-[260px] gap-4 rounded-[22px] p-6 transition hover:-translate-y-1 hover:border-[rgba(201,100,66,0.28)] hover:shadow-[0_20px_46px_rgba(20,20,19,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-2">
          <span className="inline-flex min-h-8 w-fit items-center rounded-full bg-[rgba(201,100,66,0.09)] px-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--terracotta)]">
            {topic.topicCode}
          </span>
          <span className="inline-flex min-h-8 w-fit items-center rounded-full bg-[var(--success-soft)] px-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--success)]">
            Live now
          </span>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--warm-sand)] text-lg text-[var(--near-black)] transition group-hover:translate-x-0.5">
          →
        </span>
      </div>

      <div className="grid gap-2">
        <h3 className="text-[1.55rem] text-[var(--near-black)]">{topic.displayName}</h3>
        <p className="text-[0.98rem] leading-7 text-[var(--olive-gray)]">{topic.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 text-[0.94rem] text-[var(--olive-gray)]">
        <span>{topic.questionCount} extracted questions</span>
        <span>{topic.sourceFolder}</span>
      </div>
    </Link>
  );
}
