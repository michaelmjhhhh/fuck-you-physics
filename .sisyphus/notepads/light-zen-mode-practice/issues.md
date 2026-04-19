## Issues
# issues

No issues observed while adding test scripts and devDependencies. If CI fails due to network or lockfile divergence, run 'npm install' locally.


No issues encountered while updating package.json.

Vitest startup verification surfaced two environment notes:
- TypeScript LSP diagnostics are unavailable here because `typescript-language-server` is not installed
- Vitest emits a non-fatal Vite CJS deprecation warning during startup

No blockers encountered while adding the CI workflow.

Diagnostics note:
- `lsp_diagnostics` is unavailable for the markdown notepad files because no markdown LSP is configured in this workspace

## 2026-04-19 RED tests for Light Zen (Task 4)

- Workspace Vitest baseline does not currently resolve the `@/*` alias from `tsconfig` during direct `npm run test -- practice-client` runs.
- Added `components/__tests__/vitest.practice-client.config.ts` for targeted execution with `@` alias resolution and automatic JSX runtime in this RED task context.
- LSP diagnostics for TypeScript remain unavailable in this environment (`typescript-language-server` missing), matching previously recorded workspace constraints.

## 2026-04-19 reusable Zen hook

- `lsp_diagnostics` still cannot run for the new `.ts/.tsx` hook files because TypeScript language server is not installed in this workspace.
- The new hook test suite is intentionally isolated from the existing practice UI so the hook can be reused in the next integration task without coupling to component markup.

## Light Zen Testing Blockers
- Vitest testing framework initially crashed with `ReferenceError: React is not defined`. This required adjusting `vitest.config.ts` to include `esbuild: { jsx: 'automatic' }` and an explicit alias for `@` paths to properly transpile Next.js components.
- The legacy tests for Zen mode assert against `document.body.textContent` directly, preventing a pure CSS approach to visually hiding elements. We must use React conditional rendering `{!zenMode && ...}` to pass the assertions.

## 2026-04-19 Task 8 GREEN integration

- `npx tsc --noEmit` can fail if it starts before Next-generated `.next/types/**` files are present; in this repo it passed once rerun after a completed `npm run build`.
- No new product blockers were introduced by the hook integration itself; the remaining verification caveat is environment-specific TypeScript LSP unavailability (`typescript-language-server` not installed).

## 2026-04-19 Task 9 Zen boundary refactor

- No product behavior blockers found during the refactor.
- Verification still relies on `npm run test` and `npm run build` because TypeScript LSP diagnostics remain unavailable in this environment.

## 2026-04-19 Task 10 regression coverage for progress visibility + answer flow

- TypeScript LSP diagnostics remain unavailable in this environment (`typescript-language-server` missing), so validation continued via required Vitest and build commands.
- Initial regression test attempt used an exact `/^b$/i` button-text matcher and failed because option buttons include both label and option text in one control; resolved by switching to a deterministic option-button helper matching label prefix.
- No product-code blockers encountered; all required verification commands passed after test helper correction.

## 2026-04-19 Task 11 Responsive + A11y Polish Assertions

- JSDOM does not natively trigger standard behavior like simulating clicks when `Enter` or `Space` are pressed on a button, necessitating manual `click` dispatches in tests.
- Because JSDOM lacks a real layout engine, asserting responsive design behaviors (e.g. `flex-wrap` and touch target size) requires checking raw className attributes (`min-h-11`, `min-h-12`) rather than computed styles.
- As previously recorded, TypeScript LSP diagnostics remain unavailable in this environment, relying on `npm run test` and `npm run build` for complete verification.

## 2026-04-19 Task 11 QA Fix - JSDOM Default Actions

- JSDOM does not automatically execute the default `click` action for a `<button>` receiving a simulated `Enter` or `Space` `keydown` event. This is why testing native keyboard interaction required a custom helper to dispatch the `keydown/keyup` signals and explicitly invoke `.click()`, thereby avoiding a literal `MouseEvent` instantiation in the test flow.


## 2026-04-19 Final manual QA gate (Playwright)

- Manual QA found a behavior mismatch against the zen expectation used in this gate: `Next question` remained visible while zen mode was active in the tested route.
- Console captured repeated Next.js LCP warning for image `"/A4-Rigid-Body-Mechanics/May 2000 HL Q10 C.png"`; no runtime JS errors were observed.


## 2026-04-19 F3 scope correction re-run

- Initial targeted re-check used `networkidle` and hit a dev-mode timeout due to ongoing background activity; stabilized by switching to `domcontentloaded` + explicit control visibility wait.
- No product runtime errors surfaced; console remained limited to known Next.js LCP warnings.
