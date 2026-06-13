import { SiteHeader } from '@/components/site-header';
import { TopicCard } from '@/components/topic-card';
import { getSyllabusSections } from '@/lib/topics';

export default async function HomePage() {
  const sections = await getSyllabusSections();
  const totalQuestions = sections.reduce(
    (sum, section) => sum + section.topics.reduce((sectionSum, topic) => sectionSum + topic.questionCount, 0),
    0,
  );
  const liveTopics = sections.flatMap((section) => section.topics.slice(0, 2)).slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main className="app-shell pb-24">
        <section className="grid gap-8 border-b border-[var(--border-cream)] py-12">
          <div className="grid max-w-[880px] gap-5">
            <span className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Structured from source images</span>
            <h1 className="text-[2.9rem] leading-[1.05] text-[var(--near-black)] md:text-[4.1rem]">IB Physics practice desk</h1>
            <p className="reading-measure text-[1.08rem] text-[var(--olive-gray)]">
              Work through extracted past-paper questions in a quieter academic interface built for sustained reading, source-image review, and focused answer checking.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#syllabus"
                className="focus-ring inline-flex min-h-[46px] items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--ivory)] transition hover:bg-[var(--accent-deep)]"
              >
                Browse syllabus
              </a>
              <a
                href="/practice/a4-rigid-body-mechanics"
                className="focus-ring inline-flex min-h-[46px] items-center justify-center rounded-md border border-[var(--border-cream)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--near-black)] transition hover:border-[var(--accent-muted)]"
              >
                Open live practice
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-md border border-[var(--border-cream)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm text-[var(--near-black)]">{totalQuestions} extracted questions</span>
              <span className="rounded-md border border-[var(--border-cream)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm text-[var(--near-black)]">{sections.filter((section) => section.topics.length > 0).length} sections live</span>
            </div>
            <div className="grid gap-4 rounded-lg border border-[var(--border-cream)] bg-[var(--surface-soft)] p-5 shadow-[0_12px_32px_var(--shadow-soft)]">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">Quick start</span>
                  <h2 className="mt-2 text-[1.7rem] leading-tight text-[var(--near-black)]">Start from a live topic instead of scanning the full course map.</h2>
                </div>
                <p className="max-w-[520px] text-[0.98rem] leading-7 text-[var(--olive-gray)]">
                  Jump straight into one of the currently prepared sets, then come back to the syllabus only when you want broader coverage.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {liveTopics.map((topic) => (
                  <a
                    key={topic.slug}
                    href={`/practice/${topic.slug}`}
                    className="focus-ring grid min-h-[168px] gap-3 rounded-lg border border-[var(--border-cream)] bg-[rgba(255,255,255,0.68)] p-4 transition hover:border-[var(--accent-muted)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex min-h-8 items-center rounded-md bg-[var(--accent-soft)] px-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--accent-deep)]">
                        {topic.topicCode}
                      </span>
                      <span className="rounded-md bg-[var(--success-soft)] px-3 py-1 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-[var(--success)]">
                        Ready now
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="text-[1.2rem] leading-6 text-[var(--near-black)]">{topic.displayName}</h3>
                      <p className="text-[0.92rem] leading-6 text-[var(--olive-gray)]">{topic.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 text-[0.88rem] text-[var(--olive-gray)]">
                      <span className="font-semibold text-[var(--near-black)]">{topic.questionCount} questions</span>
                      <span>Open topic →</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="syllabus" className="pb-24 pt-8">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Course map</span>
              <h2 className="mt-2 text-[2.25rem] leading-tight text-[var(--near-black)]">Choose a section, then drill into a live topic.</h2>
            </div>
            <p className="max-w-[620px] text-[1.02rem] leading-8 text-[var(--olive-gray)]">
              The syllabus is now data-driven instead of hardcoded per card. As new topic datasets arrive, they appear in the right section automatically.
            </p>
          </div>

          <div className="grid gap-10">
            {sections.map((section) => (
              <section key={section.letter} className="grid gap-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="inline-flex min-h-8 items-center rounded-md bg-[var(--accent-soft)] px-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--accent-deep)]">
                      Section {section.letter}
                    </span>
                    <h3 className="text-[1.7rem] text-[var(--near-black)]">{section.title}</h3>
                  </div>
                  <span className="text-sm text-[var(--stone-gray)]">{section.topics.length} topic{section.topics.length === 1 ? '' : 's'}</span>
                </div>

                {section.topics.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {section.topics.map((topic) => (
                      <TopicCard key={topic.slug} topic={topic} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-[var(--border-cream)] bg-[var(--surface-soft)] p-6 text-[var(--stone-gray)]">
                    This section does not have extracted topics yet.
                  </div>
                )}
              </section>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
