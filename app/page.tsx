import { SiteHeader } from '@/components/site-header';
import { TopicCard } from '@/components/topic-card';
import { getSyllabusSections } from '@/lib/topics';

export default async function HomePage() {
  const sections = await getSyllabusSections();
  const totalQuestions = sections.reduce(
    (sum, section) => sum + section.topics.reduce((sectionSum, topic) => sectionSum + topic.questionCount, 0),
    0,
  );

  return (
    <>
      <SiteHeader />
      <main className="app-shell pb-24">
        <section className="grid gap-8 py-14">
          <div className="grid gap-5">
            <span className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[var(--terracotta)]">Structured from source images</span>
            <h1 className="max-w-none text-[clamp(3.2rem,5vw,5.4rem)] text-[var(--near-black)]">A calmer way to study IB Physics past-paper questions.</h1>
            <div className="flex flex-wrap gap-3">
              <a
                href="#syllabus"
                className="focus-ring inline-flex min-h-[46px] items-center justify-center rounded-full bg-[linear-gradient(180deg,var(--terracotta)_0%,var(--terracotta-deep)_100%)] px-5 py-3 text-sm font-semibold text-[var(--ivory)] shadow-[0_10px_24px_rgba(201,100,66,0.22)] transition hover:-translate-y-0.5"
              >
                Browse syllabus
              </a>
              <a
                href="/practice/a4-rigid-body-mechanics"
                className="focus-ring inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--border-cream)] bg-[rgba(250,249,245,0.92)] px-5 py-3 text-sm font-semibold text-[var(--near-black)] shadow-[0_0_0_1px_rgba(232,230,220,0.55)] transition hover:-translate-y-0.5"
              >
                Open live practice
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-[rgba(232,230,220,0.95)] bg-[rgba(250,249,245,0.88)] px-4 py-2.5 text-sm text-[var(--near-black)] shadow-[0_8px_24px_var(--shadow-soft)]">{totalQuestions} extracted questions</span>
              <span className="rounded-full border border-[rgba(232,230,220,0.95)] bg-[rgba(250,249,245,0.88)] px-4 py-2.5 text-sm text-[var(--near-black)] shadow-[0_8px_24px_var(--shadow-soft)]">{sections.filter((section) => section.topics.length > 0).length} sections live</span>
            </div>
          </div>
        </section>

        <section id="syllabus" className="rounded-[32px] bg-[rgba(250,249,245,0.72)] px-6 pb-24 pt-8">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[var(--terracotta)]">Course map</span>
              <h2 className="mt-2 text-[clamp(2rem,3vw,2.7rem)] text-[var(--near-black)]">Choose a section, then drill into any live topic inside it.</h2>
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
                    <span className="inline-flex min-h-8 items-center rounded-full bg-[rgba(201,100,66,0.09)] px-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--terracotta)]">
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
                  <div className="rounded-[22px] border border-[var(--border-cream)] bg-[rgba(250,249,245,0.56)] p-6 text-[var(--stone-gray)]">
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
