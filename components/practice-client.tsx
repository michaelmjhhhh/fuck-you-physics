'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { QuestionRecord, TopicMeta } from '@/lib/types';
import { renderRichTextToHtml } from '@/lib/rich-text';
import { useLightZenMode } from './use-light-zen-mode';

function PracticeModeControls({
  zenMode,
  toggleZen,
  topic,
  topics,
}: {
  zenMode: boolean;
  toggleZen: () => void;
  topic: TopicMeta;
  topics: TopicMeta[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggleZen}
        aria-pressed={zenMode}
        className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--terracotta)] focus-visible:ring-offset-2 ${
          zenMode
            ? 'border-[rgba(201,100,66,0.32)] bg-[rgba(201,100,66,0.1)] text-[var(--terracotta-deep)]'
            : 'border-[var(--border-cream)] bg-[var(--ivory)] text-[var(--near-black)]'
        }`}
      >
        {zenMode ? 'Exit Light Zen' : 'Light Zen'}
      </button>
      {!zenMode && topics.map((candidate) => (
        <Link
          key={candidate.slug}
          href={`/practice/${candidate.slug}`}
          className={`inline-flex min-h-11 flex-wrap items-center justify-center rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${
            topic.slug === candidate.slug
              ? 'border-[rgba(201,100,66,0.32)] bg-[rgba(201,100,66,0.1)] text-[var(--terracotta-deep)]'
              : 'border-[var(--border-cream)] bg-[var(--ivory)] text-[var(--near-black)]'
          }`}
        >
          <span>{candidate.topicCode}</span>
          <span className={`text-[0.65rem] font-medium uppercase tracking-wide ${topic.slug === candidate.slug ? 'text-[var(--terracotta)]' : 'text-[var(--stone-gray)]'} ${candidate.sectionLetter !== topic.sectionLetter ? 'ml-1.5' : ''}`}>
            {candidate.sectionLetter !== topic.sectionLetter ? `Sec ${candidate.sectionLetter}` : 'Same section'}
          </span>
        </Link>
      ))}
      {!zenMode && (
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-cream)] bg-[var(--ivory)] px-4 py-2.5 text-sm font-semibold text-[var(--near-black)] transition hover:-translate-y-0.5"
        >
          Back to syllabus
        </Link>
      )}
    </div>
  );
}

function PracticeTopicSummary({
  zenMode,
  topic,
  questionsLength,
  imageStemMode,
}: {
  zenMode: boolean;
  topic: TopicMeta;
  questionsLength: number;
  imageStemMode: boolean;
}) {
  if (zenMode) return null;

  return (
    <section className="mb-7 grid gap-4">
      <h1 className="max-w-[900px] text-[clamp(2.6rem,5vw,4.4rem)] text-[var(--near-black)]">{topic.displayName}</h1>
      <p className="max-w-[760px] text-[1.06rem] leading-8 text-[var(--olive-gray)]">
        Choose your answer, reveal the key, and keep the explanation close to the original extracted question source.
      </p>
      <div className="flex flex-wrap gap-3">
        <span className="rounded-full border border-[var(--border-cream)] bg-[rgba(250,249,245,0.92)] px-4 py-2 text-sm text-[var(--near-black)] shadow-[0_8px_24px_var(--shadow-soft)]">
          {topic.topicCode} active topic
        </span>
        <span className="rounded-full border border-[var(--border-cream)] bg-[rgba(250,249,245,0.92)] px-4 py-2 text-sm text-[var(--near-black)] shadow-[0_8px_24px_var(--shadow-soft)]">
          {questionsLength} questions in this set
        </span>
        <span className="rounded-full border border-[var(--border-cream)] bg-[rgba(250,249,245,0.92)] px-4 py-2 text-sm text-[var(--near-black)] shadow-[0_8px_24px_var(--shadow-soft)]">
          {imageStemMode ? 'Image-first practice' : 'Structured text practice'}
        </span>
      </div>
    </section>
  );
}

function PracticeSidebar({
  zenMode,
  topic,
  currentQuestion,
  currentIndex,
  questionsLength,
  progressRatio,
  imageStemMode,
}: {
  zenMode: boolean;
  topic: TopicMeta;
  currentQuestion: QuestionRecord;
  currentIndex: number;
  questionsLength: number;
  progressRatio: number;
  imageStemMode: boolean;
}) {
  return (
    <aside className={`editorial-card grid gap-4 rounded-[22px] p-5 transition-all duration-300 ${zenMode ? 'border-transparent bg-transparent p-0 shadow-none' : 'lg:sticky lg:top-[18px]'}`}>
      {!zenMode && (
        <div className="grid gap-2">
          <h2 className="text-[1.65rem] text-[var(--near-black)]">{topic.displayName}</h2>
          <p className="text-[0.98rem] text-[var(--olive-gray)]">{currentQuestion.paper.session_label} · {currentQuestion.paper.level}{currentQuestion.paper.timezone ? ` ${currentQuestion.paper.timezone}` : ''}</p>
        </div>
      )}

      <div className="grid gap-3">
        <div className={`rounded-2xl border border-[var(--border-warm)] p-4 transition-all duration-300 ${zenMode ? 'bg-transparent border-transparent p-0' : 'bg-[rgba(255,255,255,0.46)]'}`}>
          {!zenMode && <span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Progress</span>}
          {!zenMode && <strong className="text-[var(--near-black)]">Question {currentIndex + 1} of {questionsLength}</strong>}
          <div className={`overflow-hidden rounded-full bg-[rgba(209,207,197,0.5)] transition-all duration-300 ${zenMode ? 'h-1.5' : 'mt-3 h-2.5'}`}>
            <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--terracotta)_0%,var(--terracotta-deep)_100%)] transition-all" style={{ width: `${progressRatio}%` }} />
          </div>
        </div>
        {!zenMode && (
          <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.46)] p-4">
            <span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Session mode</span>
            <strong className="text-[var(--near-black)]">{imageStemMode ? 'Image-based MCQ review' : 'Text-based MCQ review'}</strong>
          </div>
        )}
      </div>

      {!zenMode && (
        <>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.46)] p-4">
              <span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Paper</span>
              <span className="text-[var(--near-black)]">{currentQuestion.paper.paper_code} · {currentQuestion.paper.source_filename}</span>
            </div>
            <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.46)] p-4">
              <span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Sub-topic</span>
              <span className="text-[var(--near-black)]">{currentQuestion.sub_topic || 'Prepared practice question'}</span>
            </div>
            <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.46)] p-4">
              <span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Question</span>
              <span className="text-[var(--near-black)]">Question {currentQuestion.question_number}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.46)] p-4 text-[0.98rem] leading-7 text-[var(--olive-gray)]">
            Choose an answer first, then reveal the key. The layout keeps source, options, and feedback in one reading flow.
          </div>
        </>
      )}
    </aside>
  );
}

function cleanOptionText(text: string) {
  if (!text || text === 'From source image') return '';
  return text.replace(/^[_\-—\s]+/, '').replace(/^([ABCD])[\.)]\s*/i, '').trim();
}

function isLabelOnlyOption(text: string) {
  return /^[ABCD]$/i.test(text.trim());
}

function normalizeOptions(question: QuestionRecord) {
  const byLabel = new Map((question.options ?? []).map((option) => [option.label, option]));
  return ['A', 'B', 'C', 'D'].map((label) => ({
    label,
    text: cleanOptionText(byLabel.get(label)?.text ?? ''),
  }));
}

function getRenderableQuestionIndex(questions: QuestionRecord[], startIndex: number) {
  const hasRenderableOptions = (question: QuestionRecord) => normalizeOptions(question).some((option) => Boolean(option.text));

  if (hasRenderableOptions(questions[startIndex])) return startIndex;

  for (let i = startIndex + 1; i < questions.length; i += 1) {
    if (hasRenderableOptions(questions[i])) return i;
  }
  for (let i = 0; i < startIndex; i += 1) {
    if (hasRenderableOptions(questions[i])) return i;
  }

  return startIndex;
}

export function PracticeClient({
  topic,
  questions,
  topics,
}: {
  topic: TopicMeta;
  questions: QuestionRecord[];
  topics: TopicMeta[];
}) {
  const [currentIndex, setCurrentIndex] = useState(() => getRenderableQuestionIndex(questions, 0));
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { isZen: zenMode, toggleZen } = useLightZenMode();

  const currentQuestion = questions[currentIndex];
  const options = useMemo(() => normalizeOptions(currentQuestion), [currentQuestion]);
  const progressRatio = ((currentIndex + 1) / questions.length) * 100;
  const imageStemMode = Boolean(currentQuestion.source_image_path);
  const hasOptions = options.some((option) => Boolean(option.text));
  const isCorrect = selectedLabel === currentQuestion.correct_answer;

  const goToQuestion = (nextIndex: number) => {
    const bounded = Math.max(0, Math.min(nextIndex, questions.length - 1));
    setCurrentIndex(getRenderableQuestionIndex(questions, bounded));
    setSelectedLabel(null);
    setRevealed(false);
  };

  return (
    <div className="app-shell py-7 pb-24">
      <div className={`mb-8 flex flex-wrap items-center gap-5 ${zenMode ? 'justify-end' : 'justify-between'}`}>
        {!zenMode && (
          <div className="grid gap-1">
            <div className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[var(--terracotta)]">Prepared practice</div>
            <div className="text-sm font-semibold text-[var(--near-black)]">Structured questions from the extraction pipeline</div>
          </div>
        )}

        <PracticeModeControls zenMode={zenMode} toggleZen={toggleZen} topic={topic} topics={topics} />
      </div>

      <PracticeTopicSummary
        zenMode={zenMode}
        topic={topic}
        questionsLength={questions.length}
        imageStemMode={imageStemMode}
      />

      <div className={`grid items-start gap-6 ${zenMode ? 'mx-auto max-w-4xl' : 'lg:grid-cols-[330px_minmax(0,1fr)]'}`}>
        <PracticeSidebar
          zenMode={zenMode}
          topic={topic}
          currentQuestion={currentQuestion}
          currentIndex={currentIndex}
          questionsLength={questions.length}
          progressRatio={progressRatio}
          imageStemMode={imageStemMode}
        />

        <section className="grid gap-5">
          <article className="editorial-card rounded-[22px] p-7">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div className="grid gap-2">
                <h2 className="text-[1.9rem] text-[var(--near-black)]">{currentQuestion.topic_code} · {currentQuestion.sub_topic || 'Practice question'}</h2>
                <div className="text-[0.92rem] text-[var(--stone-gray)]">Question {currentIndex + 1} of {questions.length}</div>
              </div>
              <div className="rounded-full bg-[var(--warm-sand)] px-4 py-2 text-[0.85rem] text-[#4d4c48] shadow-[0_0_0_1px_rgba(209,207,197,0.45)]">
                Correct answer: {revealed ? currentQuestion.correct_answer : 'hidden'}
              </div>
            </div>

            {currentQuestion.source_image_path ? (
              <div className="mb-5 grid min-h-[240px] items-center rounded-[18px] border border-[var(--border-warm)] bg-[rgba(255,255,255,0.44)] p-3">
                <Image
                  src={`/${currentQuestion.source_image_path}`}
                  alt="Question source image"
                  width={1200}
                  height={900}
                  className="h-auto w-full rounded-[14px] border border-[var(--border-cream)] bg-white"
                />
              </div>
            ) : null}

            {!imageStemMode ? (
              <div
                className="mb-5 rounded-[18px] border border-[var(--border-warm)] bg-[rgba(255,255,255,0.44)] p-5 text-[1.08rem] text-[var(--near-black)]"
                dangerouslySetInnerHTML={{ __html: renderRichTextToHtml(currentQuestion.content_markdown) }}
              />
            ) : null}

            {!hasOptions ? (
              <div className="mb-5 grid gap-1 rounded-[18px] border border-[var(--border-warm)] bg-[rgba(255,255,255,0.44)] p-4">
                <strong className="text-[var(--near-black)]">Answer options unavailable</strong>
                <p className="text-[var(--olive-gray)]">This question does not yet have renderable option text, so the practice view skips it when possible.</p>
              </div>
            ) : null}

            <div className="grid gap-3 min-h-[112px]">
              {options.map((option) => {
                if (!option.text) return null;

                const labelOnly = isLabelOnlyOption(option.text);
                const selected = selectedLabel === option.label && !revealed;
                const correct = revealed && option.label === currentQuestion.correct_answer;
                const incorrect = revealed && option.label === selectedLabel && option.label !== currentQuestion.correct_answer;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      if (!revealed) setSelectedLabel(option.label);
                    }}
                    className={`grid w-full items-start gap-4 rounded-[18px] border p-[18px] text-left transition ${
                      labelOnly ? 'min-w-[96px] max-w-[96px] grid-cols-[56px]' : 'grid-cols-[56px_minmax(0,1fr)]'
                    } ${
                      selected
                        ? 'border-[var(--terracotta)] bg-[rgba(201,100,66,0.08)] shadow-[0_0_0_1px_rgba(201,100,66,0.32)]'
                        : correct
                          ? 'border-[var(--success)] bg-[var(--success-soft)] shadow-[0_0_0_1px_rgba(63,107,83,0.28)]'
                          : incorrect
                            ? 'border-[var(--error)] bg-[var(--error-soft)] shadow-[0_0_0_1px_rgba(181,51,51,0.22)]'
                            : 'border-[var(--border-warm)] bg-[rgba(255,255,255,0.62)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(20,20,19,0.05)]'
                    }`}
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--warm-sand)] font-semibold text-[#4d4c48] shadow-[0_0_0_1px_rgba(209,207,197,0.42)]">
                      {option.label}
                    </span>
                    {!labelOnly ? (
                      <span
                        className="text-[var(--near-black)]"
                        dangerouslySetInnerHTML={{ __html: renderRichTextToHtml(option.text) }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--warm-sand)] px-5 py-3 font-semibold text-[#4d4c48] shadow-[0_0_0_1px_rgba(209,207,197,0.45)] transition hover:-translate-y-0.5 disabled:opacity-45 disabled:hover:translate-y-0"
              >
                Previous question
              </button>
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex + 1)}
                disabled={currentIndex === questions.length - 1}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--warm-sand)] px-5 py-3 font-semibold text-[#4d4c48] shadow-[0_0_0_1px_rgba(209,207,197,0.45)] transition hover:-translate-y-0.5 disabled:opacity-45 disabled:hover:translate-y-0"
              >
                Next question
              </button>
              <button
                type="button"
                onClick={() => setRevealed(true)}
                disabled={!selectedLabel || revealed}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,var(--terracotta)_0%,var(--terracotta-deep)_100%)] px-5 py-3 font-semibold text-[var(--ivory)] shadow-[0_10px_24px_rgba(201,100,66,0.22)] transition hover:-translate-y-0.5 disabled:opacity-45 disabled:hover:translate-y-0"
              >
                Check answer
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLabel(null);
                  setRevealed(false);
                }}
                disabled={!selectedLabel && !revealed}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--warm-sand)] px-5 py-3 font-semibold text-[#4d4c48] shadow-[0_0_0_1px_rgba(209,207,197,0.45)] transition hover:-translate-y-0.5 disabled:opacity-45 disabled:hover:translate-y-0"
              >
                Choose again
              </button>
            </div>

            {revealed ? (
              <div
                className={`mt-5 grid gap-2 rounded-[22px] border p-5 ${
                  isCorrect
                    ? 'border-[rgba(63,107,83,0.35)] bg-[rgba(231,241,234,0.85)]'
                    : 'border-[rgba(181,51,51,0.25)] bg-[rgba(248,235,235,0.88)]'
                }`}
              >
                <h3 className={isCorrect ? 'text-[var(--success)]' : 'text-[var(--error)]'}>{isCorrect ? 'Correct.' : 'Not this time.'}</h3>
                <p>{isCorrect ? 'Your choice matches the prepared answer key.' : `You chose ${selectedLabel}. The prepared answer is ${currentQuestion.correct_answer}.`}</p>
                <div dangerouslySetInnerHTML={{ __html: renderRichTextToHtml(currentQuestion.vibe_explanation) }} />
              </div>
            ) : null}
          </article>
        </section>
      </div>
    </div>
  );
}
