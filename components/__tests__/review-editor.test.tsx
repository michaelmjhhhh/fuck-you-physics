import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewEditor } from '../review-editor';
import type { ReviewManifest } from '../../lib/types';

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };

reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

const baseManifest: ReviewManifest = {
  id: 'sample-1',
  topic: 'Rigid Body Mechanics',
  topic_code: 'A4',
  sub_topic: 'Moments',
  paper: {
    year: 2024,
    month: 'May',
    session_label: 'May 2024',
    level: 'HL',
    timezone: '',
    paper_code: 'Paper 1',
    source_filename: 'sample.png',
  },
  question_number: 10,
  correct_answer: 'C',
  has_diagram: false,
  diagram_metadata: {
    description: '',
    labels_to_preserve: [],
  },
  source_image_path: 'A4-Rigid-Body-Mechanics/sample.png',
  options: [
    { label: 'A', text: 'Option A' },
    { label: 'B', text: 'Option B' },
    { label: 'C', text: 'Option C' },
    { label: 'D', text: 'Option D' },
  ],
  content_markdown: 'Question text',
  vibe_explanation: 'Explanation',
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function renderReviewEditor() {
  act(() => {
    root.render(<ReviewEditor initialManifest={baseManifest} />);
  });
}

function renderReviewEditorWith(initialManifest: ReviewManifest) {
  act(() => {
    root.render(<ReviewEditor initialManifest={initialManifest} />);
  });
}

function getInputByLabel(labelText: string) {
  const label = Array.from(document.querySelectorAll('label')).find((candidate) => candidate.textContent === labelText);
  expect(label).not.toBeNull();
  const input = label?.parentElement?.querySelector('input, textarea');
  expect(input).not.toBeNull();
  return input as HTMLInputElement | HTMLTextAreaElement;
}

function getInputByPlaceholder(placeholder: string) {
  const input = Array.from(document.querySelectorAll('input, textarea')).find((candidate) => candidate.getAttribute('placeholder') === placeholder);
  expect(input).not.toBeNull();
  return input as HTMLInputElement | HTMLTextAreaElement;
}

function getButtonByName(namePattern: RegExp) {
  return Array.from(document.querySelectorAll('button')).find((button) => namePattern.test(button.textContent ?? '')) ?? null;
}

function changeField(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
  act(() => {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function loadManifestFile(fileName: string, manifest: Partial<ReviewManifest>) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
  expect(input).not.toBeNull();
  if (!input) return;

  const file = new File([JSON.stringify(manifest)], fileName, { type: 'application/json' });
  Object.defineProperty(file, 'text', {
    configurable: true,
    value: async () => JSON.stringify(manifest),
  });

  await act(async () => {
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

it('resets edits to the last loaded manifest', () => {
  renderReviewEditor();

  const subTopic = getInputByLabel('Sub-topic');
  const resetButton = getButtonByName(/reset edits/i);

  expect(resetButton).not.toBeNull();
  if (!resetButton) return;

  changeField(subTopic, 'Changed sub-topic');
  expect(subTopic.value).toBe('Changed sub-topic');

  act(() => {
    resetButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(subTopic.value).toBe('Moments');
  expect(document.body.textContent ?? '').toMatch(/edits reset to the loaded manifest/i);
});

it('resets edits to the last loaded custom manifest', async () => {
  renderReviewEditor();

  await loadManifestFile('custom.json', {
    ...baseManifest,
    sub_topic: 'Loaded custom sub-topic',
    options: [
      { label: 'A', text: 'Loaded A' },
      { label: 'B', text: 'Loaded B' },
      { label: 'C', text: 'Loaded C' },
      { label: 'D', text: 'Loaded D' },
    ],
  });

  const subTopic = getInputByLabel('Sub-topic');
  const optionA = getInputByPlaceholder('Option A text');
  const resetButton = getButtonByName(/reset edits/i);

  expect(resetButton).not.toBeNull();
  if (!resetButton) return;

  expect(subTopic.value).toBe('Loaded custom sub-topic');
  expect(optionA.value).toBe('Loaded A');

  changeField(subTopic, 'Changed after load');
  changeField(optionA, 'Changed A');

  act(() => {
    resetButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(subTopic.value).toBe('Loaded custom sub-topic');
  expect(optionA.value).toBe('Loaded A');
});

it('normalizes bundled manifests with empty options into A-D editable fields', () => {
  renderReviewEditorWith({
    ...baseManifest,
    options: [],
  });

  expect(getInputByPlaceholder('Option A text')).not.toBeNull();
  expect(getInputByPlaceholder('Option B text')).not.toBeNull();
  expect(getInputByPlaceholder('Option C text')).not.toBeNull();
  expect(getInputByPlaceholder('Option D text')).not.toBeNull();
});

it('surfaces invalid JSON load failures', async () => {
  renderReviewEditor();

  const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
  expect(input).not.toBeNull();
  if (!input) return;

  const file = new File(['{'], 'broken.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', {
    configurable: true,
    value: async () => '{',
  });

  await act(async () => {
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  expect(document.body.textContent ?? '').toMatch(/failed to load manifest/i);
});

it('downloads normalized reviewed JSON with the reviewed suffix', async () => {
  renderReviewEditor();

  const createdUrls: string[] = [];
  let capturedBlobParts: readonly BlobPart[] = [];
  let downloadedBlob: Blob | null = null;
  const OriginalBlob = Blob;
  class CapturingBlob extends OriginalBlob {
    constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
      super(blobParts, options);
      capturedBlobParts = blobParts ?? [];
    }
  }
  Object.defineProperty(globalThis, 'Blob', {
    configurable: true,
    value: CapturingBlob,
  });
  const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function clickAnchor(this: HTMLAnchorElement) {
    expect(this.download).toBe('review-manifest.reviewed.json');
    expect(this.href).toContain('blob:');
  });

  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: () => '',
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: () => undefined,
  });
  vi.spyOn(URL, 'createObjectURL').mockImplementation((value: Blob | MediaSource) => {
    expect(value).toBeInstanceOf(Blob);
    if (!(value instanceof Blob)) {
      throw new Error('Expected download payload to be a Blob.');
    }
    downloadedBlob = value;
    const nextUrl = `blob:review-${createdUrls.length}`;
    createdUrls.push(nextUrl);
    return nextUrl;
  });
  const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

  const downloadButton = getButtonByName(/download updated json/i);
  expect(downloadButton).not.toBeNull();
  if (!downloadButton) return;

  act(() => {
    downloadButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(clickSpy).toHaveBeenCalledTimes(1);
  expect(revokeSpy).toHaveBeenCalledWith('blob:review-0');
  expect(document.body.textContent ?? '').toMatch(/downloaded review-manifest.reviewed.json/i);
  expect(downloadedBlob).not.toBeNull();

  const downloadedText = String(capturedBlobParts[0] ?? '{}');
  const payload = JSON.parse(downloadedText) as ReviewManifest;
  expect(payload.options.map((option) => option.label)).toEqual(['A', 'B', 'C', 'D']);
  expect(payload.options[0]?.text).toBe('Option A');
  Object.defineProperty(globalThis, 'Blob', {
    configurable: true,
    value: OriginalBlob,
  });
});

it('documents that extra option labels are dropped during normalization', async () => {
  renderReviewEditor();

  await loadManifestFile('extra-options.json', {
    ...baseManifest,
    options: [
      { label: 'A', text: 'Alpha' },
      { label: 'B', text: 'Beta' },
      { label: 'C', text: 'Gamma' },
      { label: 'D', text: 'Delta' },
      { label: 'E', text: 'Extra' },
    ],
  });

  expect(getInputByPlaceholder('Option A text').value).toBe('Alpha');
  expect(getInputByPlaceholder('Option D text').value).toBe('Delta');
  expect(Array.from(document.querySelectorAll('input')).some((input) => input.value === 'Extra')).toBe(false);
  expect(document.body.textContent ?? '').not.toMatch(/Option E/);
});
