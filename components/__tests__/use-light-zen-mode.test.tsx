import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLightZenMode } from '../use-light-zen-mode';

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };

reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

function TestHarness() {
  const { isZen, toggleZen, exitZen } = useLightZenMode();

  return (
    <div>
      <span data-testid="state">{isZen ? 'on' : 'off'}</span>
      <button type="button" onClick={toggleZen}>
        toggle
      </button>
      <button type="button" onClick={exitZen}>
        exit
      </button>
    </div>
  );
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

function renderHook() {
  act(() => {
    root.render(<TestHarness />);
  });
}

function click(buttonText: string) {
  const button = Array.from(document.querySelectorAll('button')).find((element) => element.textContent === buttonText);
  expect(button, `expected ${buttonText} button to exist`).not.toBeNull();

  act(() => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function pressEscape() {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
}

describe('useLightZenMode', () => {
  it('starts with zen mode off', () => {
    renderHook();

    expect(document.querySelector('[data-testid="state"]')?.textContent).toBe('off');
  });

  it('toggles zen mode', () => {
    renderHook();

    click('toggle');
    expect(document.querySelector('[data-testid="state"]')?.textContent).toBe('on');

    click('toggle');
    expect(document.querySelector('[data-testid="state"]')?.textContent).toBe('off');
  });

  it('exits zen mode when escape is pressed and zen is active', () => {
    renderHook();

    click('toggle');
    pressEscape();

    expect(document.querySelector('[data-testid="state"]')?.textContent).toBe('off');
  });

  it('removes the escape listener on unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    renderHook();

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    act(() => {
      root.unmount();
    });

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
