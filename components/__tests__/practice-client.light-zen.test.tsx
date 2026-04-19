import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { PracticeClient } from '../practice-client';
import type { QuestionRecord, TopicMeta } from '../../lib/types';

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };

reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/lib/rich-text', () => ({
  renderRichTextToHtml: (value: string) => value,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />,
}));

const topic: TopicMeta = {
  slug: 'a4-rigid-body-mechanics',
  topicCode: 'A4',
  sectionLetter: 'A',
  displayName: 'A4 Rigid body mechanics',
  sourceFolder: 'A4-Rigid-Body-Mechanics',
  datasetPath: 'prepared-questions/a4-rigid-body-mechanics.json',
  questionCount: 1,
  description: 'Rigid body mechanics practice',
};

const topics: TopicMeta[] = [
  topic,
  {
    ...topic,
    slug: 'b1-thermal-energy-transfers',
    topicCode: 'B1',
    displayName: 'B1 Thermal energy transfers',
    datasetPath: 'prepared-questions/b1-thermal-energy-transfers.json',
  },
];

const questions: QuestionRecord[] = [
  {
    id: 'q-1',
    topic: 'Rigid body mechanics',
    topic_code: 'A4',
    sub_topic: 'Moments',
    paper: {
      year: 2024,
      month: 'May',
      session_label: 'May 2024',
      level: 'SL',
      timezone: 'TZ1',
      paper_code: 'P1',
      source_filename: 'sample.pdf',
    },
    question_number: 1,
    content_markdown: 'A beam is in equilibrium.',
    has_diagram: false,
    diagram_metadata: {
      description: '',
      labels_to_preserve: [],
    },
    options: [
      { label: 'A', text: 'Clockwise moment is larger.' },
      { label: 'B', text: 'Anticlockwise moment is larger.' },
      { label: 'C', text: 'Moments are balanced.' },
      { label: 'D', text: 'No torque is present.' },
    ],
    correct_answer: 'C',
    vibe_explanation: 'For equilibrium, clockwise and anticlockwise moments are equal.',
  },
  {
    id: 'q-2',
    topic: 'Rigid body mechanics',
    topic_code: 'A4',
    sub_topic: 'Forces',
    paper: {
      year: 2024,
      month: 'May',
      session_label: 'May 2024',
      level: 'SL',
      timezone: 'TZ1',
      paper_code: 'P1',
      source_filename: 'sample.pdf',
    },
    question_number: 2,
    content_markdown: 'A force acts on a rigid body.',
    has_diagram: false,
    diagram_metadata: {
      description: '',
      labels_to_preserve: [],
    },
    options: [
      { label: 'A', text: 'Net force is zero.' },
      { label: 'B', text: 'Acceleration must be zero.' },
      { label: 'C', text: 'Torque must be zero.' },
      { label: 'D', text: 'Resultant can be non-zero.' },
    ],
    correct_answer: 'A',
    vibe_explanation: 'A rigid body can still rotate if net torque is non-zero.',
  },
];

function renderPracticeClient() {
  act(() => {
    root.render(<PracticeClient topic={topic} topics={topics} questions={questions} />);
  });
}

function enableLightZen() {
  const zenToggle = getButtonByName(/light zen/i);
  expect(zenToggle, 'expected Light Zen toggle control to exist').not.toBeNull();
  if (zenToggle) {
    click(zenToggle);
  }
}

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
});

function getButtonByName(namePattern: RegExp) {
  return Array.from(document.querySelectorAll('button')).find((button) => namePattern.test(button.textContent ?? '')) ?? null;
}

function getOptionButtonByLabel(label: 'A' | 'B' | 'C' | 'D') {
  const optionPattern = new RegExp(`^${label}`, 'i');
  return Array.from(document.querySelectorAll('button')).find((button) => optionPattern.test((button.textContent ?? '').trim())) ?? null;
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function pressEscape() {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
}

function queryLinkByName(namePattern: RegExp) {
  return Array.from(document.querySelectorAll('a')).find((link) => namePattern.test(link.textContent ?? '')) ?? null;
}

function hasVisibleText(textPattern: RegExp) {
  return textPattern.test(document.body.textContent ?? '');
}

function queryProgressFill() {
  return document.querySelector('div[style*="width: 50%"]');
}

function simulateKeyboardActivation(element: HTMLElement, key: 'Enter' | ' ') {
  act(() => {
    element.focus();
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
    element.click();
  });
}

describe('PracticeClient Light Zen mode', () => {
  it('toggles light zen mode on and off from the practice UI control', () => {
    renderPracticeClient();

    const zenToggle = getButtonByName(/light zen/i);
    expect(zenToggle, 'expected Light Zen toggle control to exist').not.toBeNull();

    if (!zenToggle) return;

    click(zenToggle);
    expect(zenToggle.getAttribute('aria-pressed')).toBe('true');

    click(zenToggle);
    expect(zenToggle.getAttribute('aria-pressed')).toBe('false');

    simulateKeyboardActivation(zenToggle as HTMLButtonElement, 'Enter');
    expect(zenToggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('hides top navigation and side info when zen mode is enabled', () => {
    renderPracticeClient();

    enableLightZen();

    expect(queryLinkByName(/back to syllabus/i)).toBeNull();
    expect(document.body.textContent ?? '').not.toMatch(/session mode/i);
    expect(document.body.textContent ?? '').not.toMatch(/paper/i);
  });

  it('keeps active question and progress visible while in zen mode', () => {
    renderPracticeClient();

    enableLightZen();

    expect(document.body.textContent ?? '').toMatch(/a4 · moments/i);
    expect(document.body.textContent ?? '').toMatch(/question 1 of 2/i);
    expect(queryProgressFill()).not.toBeNull();
  });

  it('does not keep the zen progress sidebar sticky while scrolling', () => {
    renderPracticeClient();

    const sidebar = document.querySelector('aside');

    expect(sidebar?.className).toMatch(/lg:sticky/);

    enableLightZen();

    const zenSidebar = document.querySelector('aside');

    expect(zenSidebar).not.toBeNull();
    expect(zenSidebar?.className).not.toMatch(/lg:sticky/);
    expect(zenSidebar?.className).not.toMatch(/lg:top-\[18px\]/);
  });

  it('exits zen mode when escape is pressed', () => {
    renderPracticeClient();

    enableLightZen();
    pressEscape();

    expect(queryLinkByName(/back to syllabus/i)).not.toBeNull();
    expect(document.body.textContent ?? '').toMatch(/session mode/i);
  });

  it('shows progress and question context in non-zen mode', () => {
    renderPracticeClient();

    expect(queryLinkByName(/back to syllabus/i)).not.toBeNull();
    expect(hasVisibleText(/progress/i)).toBe(true);
    expect(hasVisibleText(/session mode/i)).toBe(true);
    expect(hasVisibleText(/a4 · moments/i)).toBe(true);
    expect(hasVisibleText(/question 1 of 2/i)).toBe(true);
    expect(queryProgressFill()).not.toBeNull();
  });

  it('keeps answer flow controls and reset behavior correct in non-zen mode', () => {
    renderPracticeClient();

    const previousButton = getButtonByName(/previous question/i);
    const nextButton = getButtonByName(/next question/i);
    const checkAnswerButton = getButtonByName(/check answer/i);
    const chooseAgainButton = getButtonByName(/choose again/i);
    const optionB = getOptionButtonByLabel('B');

    expect(previousButton).not.toBeNull();
    expect(nextButton).not.toBeNull();
    expect(checkAnswerButton).not.toBeNull();
    expect(chooseAgainButton).not.toBeNull();
    expect(optionB).not.toBeNull();

    if (!previousButton || !nextButton || !checkAnswerButton || !chooseAgainButton || !optionB) return;

    expect(previousButton.hasAttribute('disabled')).toBe(true);
    expect(nextButton.hasAttribute('disabled')).toBe(false);
    expect(checkAnswerButton.hasAttribute('disabled')).toBe(true);
    expect(chooseAgainButton.hasAttribute('disabled')).toBe(true);
    expect(hasVisibleText(/correct answer: hidden/i)).toBe(true);

    click(optionB);
    expect(checkAnswerButton.hasAttribute('disabled')).toBe(false);
    expect(chooseAgainButton.hasAttribute('disabled')).toBe(false);

    click(checkAnswerButton);
    expect(hasVisibleText(/not this time\./i)).toBe(true);
    expect(hasVisibleText(/you chose b\. the prepared answer is c\./i)).toBe(true);
    expect(checkAnswerButton.hasAttribute('disabled')).toBe(true);

    click(chooseAgainButton);
    expect(hasVisibleText(/not this time\./i)).toBe(false);
    expect(hasVisibleText(/you chose b\. the prepared answer is c\./i)).toBe(false);
    expect(hasVisibleText(/correct answer: hidden/i)).toBe(true);
    expect(checkAnswerButton.hasAttribute('disabled')).toBe(true);
    expect(chooseAgainButton.hasAttribute('disabled')).toBe(true);
  });

  it('keeps answer flow and navigation controls usable in zen mode', () => {
    renderPracticeClient();
    enableLightZen();

    const previousButton = getButtonByName(/previous question/i);
    const nextButton = getButtonByName(/next question/i);
    const checkAnswerButton = getButtonByName(/check answer/i);
    const chooseAgainButton = getButtonByName(/choose again/i);
    const optionB = getOptionButtonByLabel('B');

    expect(previousButton).not.toBeNull();
    expect(nextButton).not.toBeNull();
    expect(checkAnswerButton).not.toBeNull();
    expect(chooseAgainButton).not.toBeNull();
    expect(optionB).not.toBeNull();

    if (!previousButton || !nextButton || !checkAnswerButton || !chooseAgainButton || !optionB) return;

    expect(previousButton.hasAttribute('disabled')).toBe(true);
    expect(nextButton.hasAttribute('disabled')).toBe(false);

    click(optionB);
    expect(checkAnswerButton.hasAttribute('disabled')).toBe(false);
    expect(chooseAgainButton.hasAttribute('disabled')).toBe(false);

    click(checkAnswerButton);
    expect(hasVisibleText(/not this time\./i)).toBe(true);
    expect(hasVisibleText(/you chose b\. the prepared answer is c\./i)).toBe(true);

    click(chooseAgainButton);
    expect(hasVisibleText(/not this time\./i)).toBe(false);
    expect(hasVisibleText(/you chose b\. the prepared answer is c\./i)).toBe(false);
    expect(checkAnswerButton.hasAttribute('disabled')).toBe(true);
    expect(chooseAgainButton.hasAttribute('disabled')).toBe(true);

    click(nextButton);
    expect(hasVisibleText(/a4 · forces/i)).toBe(true);
    expect(previousButton.hasAttribute('disabled')).toBe(false);
    expect(nextButton.hasAttribute('disabled')).toBe(true);

    click(previousButton);
    expect(hasVisibleText(/a4 · moments/i)).toBe(true);
    expect(previousButton.hasAttribute('disabled')).toBe(true);
    expect(nextButton.hasAttribute('disabled')).toBe(false);
  });

  it('maintains mobile-friendly layout constraints and accessible touch targets for zen toggle and core controls', () => {
    renderPracticeClient();

    const controlsContainer = document.querySelector('.app-shell > div');
    expect(controlsContainer?.className).toMatch(/flex-wrap/);

    const zenToggle = getButtonByName(/light zen/i);
    expect(zenToggle).not.toBeNull();
    expect(zenToggle?.className).toMatch(/min-h-11/);
    
    const previousButton = getButtonByName(/previous question/i);
    const nextButton = getButtonByName(/next question/i);
    expect(previousButton?.className).toMatch(/min-h-12/);
    expect(nextButton?.className).toMatch(/min-h-12/);
  });

  it('supports keyboard-only activation of zen mode and Escape exit behavior without focus trap regressions', () => {
    renderPracticeClient();

    const zenToggle = getButtonByName(/light zen/i) as HTMLButtonElement;
    expect(zenToggle).not.toBeNull();

    expect(zenToggle.tabIndex).toBe(0);

    expect(zenToggle.className).toMatch(/focus-visible:ring-2/);

    simulateKeyboardActivation(zenToggle, 'Enter');

    expect(zenToggle.getAttribute('aria-pressed')).toBe('true');
    expect(document.body.textContent ?? '').not.toMatch(/session mode/i);

    expect(document.activeElement).toBe(zenToggle);

    pressEscape();

    expect(zenToggle.getAttribute('aria-pressed')).toBe('false');
    expect(document.body.textContent ?? '').toMatch(/session mode/i);

    expect(document.activeElement).toBe(zenToggle);

    const nextButton = getButtonByName(/next question/i) as HTMLButtonElement;
    expect(nextButton).not.toBeNull();
    expect(nextButton.tabIndex).toBe(0);
    
    act(() => {
      nextButton.focus();
    });
    expect(document.activeElement).toBe(nextButton);
    expect(nextButton.disabled).toBe(false);
  });
});
