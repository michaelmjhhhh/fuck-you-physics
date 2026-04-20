'use client';

import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ReviewManifest } from '@/lib/types';

function normalizeManifest(data: Partial<ReviewManifest>): ReviewManifest {
  const labels = ['A', 'B', 'C', 'D'];
  const optionMap = new Map((Array.isArray(data.options) ? data.options : []).map((option) => [option.label, option]));

  return {
    id: data.id ?? '',
    topic: data.topic ?? '',
    topic_code: data.topic_code ?? '',
    sub_topic: data.sub_topic ?? '',
    paper: {
      year: data.paper?.year ?? '',
      month: data.paper?.month ?? '',
      session_label: data.paper?.session_label ?? '',
      level: data.paper?.level ?? '',
      timezone: data.paper?.timezone ?? '',
      paper_code: data.paper?.paper_code ?? 'Paper 1',
      source_filename: data.paper?.source_filename ?? '',
    },
    question_number: data.question_number ?? '',
    correct_answer: data.correct_answer ?? '',
    has_diagram: Boolean(data.has_diagram),
    diagram_metadata: {
      description: data.diagram_metadata?.description ?? '',
      labels_to_preserve: Array.isArray(data.diagram_metadata?.labels_to_preserve)
        ? data.diagram_metadata.labels_to_preserve
        : [],
    },
    source_image_path: data.source_image_path ?? '',
    options: labels.map((label) => ({
      label,
      text: optionMap.get(label)?.text ?? '',
    })),
    content_markdown: data.content_markdown ?? '',
    vibe_explanation: data.vibe_explanation ?? '',
  };
}

function downloadJson(fileName: string, value: ReviewManifest) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.replace(/\.json$/i, '') + '.reviewed.json';
  link.click();
  URL.revokeObjectURL(url);
}

export function ReviewEditor({ initialManifest }: { initialManifest: ReviewManifest }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [manifest, setManifest] = useState<ReviewManifest>(initialManifest);
  const [originalManifest, setOriginalManifest] = useState<ReviewManifest>(initialManifest);
  const [loadedFileName, setLoadedFileName] = useState('review-manifest.json');
  const [status, setStatus] = useState<{ tone: 'neutral' | 'success' | 'error'; message: string }>({
    tone: 'neutral',
    message: 'Loaded the bundled sample manifest. You can edit it directly or load another JSON file.',
  });

  const fieldIds = {
    subTopic: 'review-sub-topic',
    labelsToPreserve: 'review-labels-to-preserve',
    contentMarkdown: 'review-content-markdown',
    diagramDescription: 'review-diagram-description',
    vibeExplanation: 'review-vibe-explanation',
  };

  const subtitle = useMemo(() => {
    return `${manifest.paper.session_label} · ${manifest.paper.level}${manifest.paper.timezone ? ` ${manifest.paper.timezone}` : ''}`.trim();
  }, [manifest.paper]);

  const updateOption = (label: string, text: string) => {
    setManifest((current) => ({
      ...current,
      options: current.options.map((option) => (option.label === label ? { ...option, text } : option)),
    }));
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<ReviewManifest>;
      const normalized = normalizeManifest(parsed);
      setManifest(normalized);
      setOriginalManifest(normalized);
      setLoadedFileName(file.name);
      setStatus({ tone: 'success', message: `Loaded ${file.name}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus({ tone: 'error', message: `Failed to load manifest: ${message}` });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <main className="app-shell py-12 pb-24">
      <section className="mb-10 grid gap-4">
        <span className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--terracotta)]">Review desk</span>
        <h1 className="max-w-[820px] text-[clamp(2.75rem,5vw,4.5rem)] text-[var(--near-black)]">Shape one extracted question into publication-grade data.</h1>
        <p className="max-w-[720px] text-[1.05rem] leading-8 text-[var(--olive-gray)]">
          Load a generated manifest, refine the markdown, fill in the answer options, preserve diagram details, and export a clean JSON record for the importer.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <aside className="editorial-card grid gap-4 rounded-[22px] p-6 lg:sticky lg:top-[18px]">
          <div>
            <h2 className="mb-2 text-[1.65rem] text-[var(--near-black)]">Manifest actions</h2>
            <p className="text-[0.96rem] leading-7 text-[var(--olive-gray)]">Use a generated manifest from the scanner, edit the missing fields, then download the updated JSON.</p>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-cream)] bg-[rgba(250,249,245,0.92)] px-5 py-3 text-sm font-semibold text-[var(--near-black)] transition hover:-translate-y-0.5"
            >
              Load manifest JSON
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFileChange} />

            <button
              type="button"
              onClick={() => {
                downloadJson(loadedFileName, manifest);
                setStatus({ tone: 'success', message: `Downloaded ${loadedFileName.replace(/\.json$/i, '')}.reviewed.json` });
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,var(--terracotta)_0%,var(--terracotta-deep)_100%)] px-5 py-3 text-sm font-semibold text-[var(--ivory)] shadow-[0_10px_24px_rgba(201,100,66,0.22)] transition hover:-translate-y-0.5"
            >
              Download updated JSON
            </button>

            <button
              type="button"
              onClick={() => {
                setManifest(originalManifest);
                setStatus({ tone: 'success', message: 'Edits reset to the loaded manifest.' });
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--warm-sand)] px-5 py-3 text-sm font-semibold text-[#4d4c48] shadow-[0_0_0_1px_rgba(209,207,197,0.45)] transition hover:-translate-y-0.5"
            >
              Reset edits
            </button>
          </div>

          <p className={`min-h-6 text-sm ${status.tone === 'error' ? 'text-[var(--error)]' : status.tone === 'success' ? 'text-[var(--terracotta)]' : 'text-[var(--olive-gray)]'}`}>
            {status.message}
          </p>
        </aside>

        <section className="grid gap-6">
          <article className="editorial-card rounded-[22px] p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--terracotta)]">{manifest.topic_code || 'Topic'} review</span>
                <h2 className="mt-2 text-[2rem] text-[var(--near-black)]">{manifest.topic || 'Untitled manifest'}</h2>
              </div>
              <p className="text-[0.96rem] text-[var(--olive-gray)]">{subtitle || 'No paper metadata loaded yet.'}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.4)] p-4"><span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Question ID</span><span className="break-all font-mono text-[0.88rem] text-[var(--near-black)]">{manifest.id || '—'}</span></div>
              <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.4)] p-4"><span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Correct answer</span><span className="text-[var(--near-black)]">{manifest.correct_answer || '—'}</span></div>
              <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.4)] p-4"><span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Paper</span><span className="text-[var(--near-black)]">{`${manifest.paper.month} ${manifest.paper.year} · ${manifest.paper.paper_code}`.trim()}</span></div>
              <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.4)] p-4"><span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Question number</span><span className="text-[var(--near-black)]">{manifest.question_number || '—'}</span></div>
              <div className="rounded-2xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.4)] p-4 md:col-span-2"><span className="mb-1 block text-[0.73rem] uppercase tracking-[0.08em] text-[var(--stone-gray)]">Source image path</span><span className="break-all font-mono text-[0.88rem] text-[var(--near-black)]">{manifest.source_image_path || '—'}</span></div>
            </div>
          </article>

          <article className="editorial-card rounded-[22px] p-6">
            <div className="mb-5">
              <h2 className="text-[1.65rem] text-[var(--near-black)]">Extraction fields</h2>
              <p className="mt-2 text-[0.96rem] leading-7 text-[var(--olive-gray)]">Edit only the content that needs review. Metadata from the scanner stays intact.</p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor={fieldIds.subTopic} className="text-[0.84rem] font-medium text-[var(--near-black)]">Sub-topic</label>
                  <input
                    id={fieldIds.subTopic}
                    value={manifest.sub_topic}
                    onChange={(event) => setManifest((current) => ({ ...current, sub_topic: event.target.value }))}
                    className="w-full rounded-xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-[var(--near-black)] outline-none transition focus:border-[var(--focus-blue)] focus:shadow-[0_0_0_1px_var(--focus-blue)]"
                    placeholder="Specific sub-unit"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor={fieldIds.labelsToPreserve} className="text-[0.84rem] font-medium text-[var(--near-black)]">Labels to preserve</label>
                  <input
                    id={fieldIds.labelsToPreserve}
                    value={manifest.diagram_metadata.labels_to_preserve.join(', ')}
                    onChange={(event) => setManifest((current) => ({
                      ...current,
                      diagram_metadata: {
                        ...current.diagram_metadata,
                        labels_to_preserve: event.target.value.split(',').map((label) => label.trim()).filter(Boolean),
                      },
                    }))}
                    className="w-full rounded-xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-[var(--near-black)] outline-none transition focus:border-[var(--focus-blue)] focus:shadow-[0_0_0_1px_var(--focus-blue)]"
                    placeholder="20 cm, chain wheel"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor={fieldIds.contentMarkdown} className="text-[0.84rem] font-medium text-[var(--near-black)]">content_markdown</label>
                <textarea
                  id={fieldIds.contentMarkdown}
                  value={manifest.content_markdown}
                  onChange={(event) => setManifest((current) => ({ ...current, content_markdown: event.target.value }))}
                  className="min-h-[180px] w-full resize-y rounded-xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-[var(--near-black)] outline-none transition focus:border-[var(--focus-blue)] focus:shadow-[0_0_0_1px_var(--focus-blue)]"
                  placeholder="Write the full question in Markdown with LaTeX."
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor={fieldIds.diagramDescription} className="text-[0.84rem] font-medium text-[var(--near-black)]">diagram_metadata.description</label>
                <textarea
                  id={fieldIds.diagramDescription}
                  value={manifest.diagram_metadata.description}
                  onChange={(event) => setManifest((current) => ({
                    ...current,
                    diagram_metadata: {
                      ...current.diagram_metadata,
                      description: event.target.value,
                    },
                  }))}
                  className="min-h-[160px] w-full resize-y rounded-xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-[var(--near-black)] outline-none transition focus:border-[var(--focus-blue)] focus:shadow-[0_0_0_1px_var(--focus-blue)]"
                  placeholder="Describe the diagram for cropping and transparency processing."
                />
              </div>

              <div className="grid gap-3">
                <label className="text-[0.84rem] font-medium text-[var(--near-black)]">Options</label>
                <div className="grid gap-3">
                  {manifest.options.map((option) => (
                    <div key={option.label} className="grid items-center gap-3 md:grid-cols-[52px_minmax(0,1fr)]">
                      <div className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--warm-sand)] font-medium text-[#4d4c48] shadow-[0_0_0_1px_rgba(209,207,197,0.45)]">
                        {option.label}
                      </div>
                      <input
                        aria-label={`Option ${option.label} text`}
                        value={option.text}
                        onChange={(event) => updateOption(option.label, event.target.value)}
                        className="w-full rounded-xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-[var(--near-black)] outline-none transition focus:border-[var(--focus-blue)] focus:shadow-[0_0_0_1px_var(--focus-blue)]"
                        placeholder={`Option ${option.label} text`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor={fieldIds.vibeExplanation} className="text-[0.84rem] font-medium text-[var(--near-black)]">vibe_explanation</label>
                <textarea
                  id={fieldIds.vibeExplanation}
                  value={manifest.vibe_explanation}
                  onChange={(event) => setManifest((current) => ({ ...current, vibe_explanation: event.target.value }))}
                  className="min-h-[160px] w-full resize-y rounded-xl border border-[var(--border-warm)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-[var(--near-black)] outline-none transition focus:border-[var(--focus-blue)] focus:shadow-[0_0_0_1px_var(--focus-blue)]"
                  placeholder="A short explanation of the physics logic."
                />
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
