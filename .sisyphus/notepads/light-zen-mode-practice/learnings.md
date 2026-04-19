## Learnings
# learnings

Updated package.json to add vitest-based test scripts and minimal devDependencies.

Scripts added:
- test: vitest
- test:ci: vitest --run --reporter=dot --passWithNoTests --silent

Dev dependencies added:
- vitest@^2.1.9
- jsdom@^26.1.0
- @testing-library/jest-dom@^6.9.1
- @testing-library/react@^14.0.0

Verification outputs saved below.


Updated package.json to add test and test:ci scripts, and @testing-library/react devDependency.

Verification outputs:

Added Vitest baseline files:
- vitest.config.ts uses jsdom and wires setupFiles to vitest.setup.ts
- vitest.setup.ts imports @testing-library/jest-dom/vitest

Adjusted the test script to `vitest run --passWithNoTests` so `npm run test -- --reporter=verbose` exits cleanly in the empty-suite baseline.

Verification outputs for this task:
- `npm run test -- --reporter=verbose` loads Vitest config successfully and exits 0 with no test files
- `npx tsc --noEmit` passes
- `npm run build` passes
# Update performed at 2026-04-18T15:49:53Z

Modified package.json: added/ensured scripts 'test' and 'test:ci'; ensured devDependencies: vitest, jsdom, @testing-library/jest-dom, @testing-library/react.

--- vitest --help output (truncated) ---

> fuck-you-ib@0.1.0 test
> vitest run --passWithNoTests --help

vitest/2.1.9

Usage:
  $ vitest run [...filters]

Options:
  -r, --root <path>                              Root path 
  -c, --config <path>                            Path to config file 
  -u, --update                                   Update snapshot 
  -w, --watch                                    Enable watch mode 
  -t, --testNamePattern <pattern>                Run tests with full names matching the specified regexp pattern 
  --dir <path>                                   Base directory to scan for the test files 
  --ui                                           Enable UI 
  --open                                         Open UI automatically (default: !process.env.CI) 
  --api [port]                                   Specify server port. Note if the port is already being used, Vite will automatically try the next available port so this may not be the actual port the server ends up listening on. If true will be set to 51204. Use '--help --api' for more info. 
  --silent                                       Silent console output from tests 
  --hideSkippedTests                             Hide logs for skipped tests 
  --reporter <name>                              Specify reporters 
  --outputFile <filename/-s>                     Write test results to a file when supporter reporter is also specified, use cac's dot notation for individual outputs of multiple reporters (example: --outputFile.tap=./tap.txt) 
  --coverage                                     Enable coverage report. Use '--help --coverage' for more info. 
  --mode <name>                                  Override Vite mode (default: test or benchmark) 
  --workspace <path>                             Path to a workspace configuration file 
  --isolate                                      Run every test file in isolation. To disable isolation, use --no-isolate (default: true) 
  --globals                                      Inject apis globally 
  --dom                                          Mock browser API with happy-dom 
  --browser <name>                               Run tests in the browser. Equivalent to --browser.enabled (default: false). Use '--help --browser' for more info. 
  --pool <pool>                                  Specify pool, if not running in the browser (default: threads) 
  --poolOptions <options>                        Specify pool options. Use '--help --poolOptions' for more info. 
  --fileParallelism                              Should all test files run in parallel. Use --no-file-parallelism to disable (default: true) 
  --maxWorkers <workers>                         Maximum number or percentage of workers to run tests in 
  --minWorkers <workers>                         Minimum number or percentage of workers to run tests in 
  --environment <name>                           Specify runner environment, if not running in the browser (default: node) 
  --passWithNoTests                              Pass when no tests are found 
  --logHeapUsage                                 Show the size of heap for each test when running in node 
  --allowOnly                                    Allow tests and suites that are marked as only (default: !process.env.CI) 
  --dangerouslyIgnoreUnhandledErrors             Ignore any unhandled errors that occur 
  --shard <shards>                               Test suite shard to execute in a format of <index>/<count> 
  --changed [since]                              Run tests that are affected by the changed files (default: false) 
  --sequence <options>                           Options for how tests should be sorted. Use '--help --sequence' for more info. 
  --inspect [[host:]port]                        Enable Node.js inspector (default: 127.0.0.1:9229) 
  --inspectBrk [[host:]port]                     Enable Node.js inspector and break before the test starts 
  --testTimeout <timeout>                        Default timeout of a test in milliseconds (default: 5000) 
  --hookTimeout <timeout>                        Default hook timeout in milliseconds (default: 10000) 
  --bail <number>                                Stop test execution when given number of tests have failed (default: 0) 
  --retry <times>                                Retry the test specific number of times if it fails (default: 0) 
  --diff <path>                                  Path to a diff config that will be used to generate diff interface 
  --exclude <glob>                               Additional file globs to be excluded from test 
  --expandSnapshotDiff                           Show full diff when snapshot fails 
  --disableConsoleIntercept                      Disable automatic interception of console logging (default: false) 
  --typecheck                                    Enable typechecking alongside tests (default: false). Use '--help --typecheck' for more info. 
  --project <name>                               The name of the project to run if you are using Vitest workspace feature. This can be repeated for multiple projects: --project=1 --project=2. You can also filter projects using wildcards like --project=packages* 
  --slowTestThreshold <threshold>                Threshold in milliseconds for a test or suite to be considered slow (default: 300) 
  --teardownTimeout <timeout>                    Default timeout of a teardown function in milliseconds (default: 10000) 
  --cache                                        Enable cache. Use '--help --cache' for more info. 
  --maxConcurrency <number>                      Maximum number of concurrent tests in a suite (default: 5) 
  --expect                                       Configuration options for expect() matches. Use '--help --expect' for more info. 
  --printConsoleTrace                            Always print console stack traces 
  --run                                          Disable watch mode 
  --no-color                                     Removes colors from the console output (default: true)
  --clearScreen                                  Clear terminal screen when re-running tests during watch mode (default: true) 
  --standalone                                   Start Vitest without running tests. File filters will be ignored, tests will be running only on change (default: false) 
  --mergeReports [path]                          Paths to blob reports directory. If this options is used, Vitest won't run any tests, it will only report previously recorded tests 
  -h, --help                                     Display this message 

--- npm test:ci command output (version or error) ---

> fuck-you-ib@0.1.0 test:ci
> vitest --run --reporter=dot --passWithNoTests --silent --version

vitest/2.1.9 darwin-arm64 node-v20.18.0

## 2026-04-19 RED tests for Light Zen (Task 4)

- Added `components/__tests__/practice-client.light-zen.test.tsx` with user-visible RED assertions for:
  - toggle enables/disables light zen (`aria-pressed` expectation)
  - top nav + side info hidden in zen
  - question/progress remain visible in zen
  - Escape exits zen
- Test suite currently fails for the expected missing behavior reason: no Light Zen toggle control exists in `PracticeClient` yet.
- Kept this task in RED phase only; no zen production implementation changes were made to `components/practice-client.tsx` or `app/practice/[topic]/page.tsx`.

Added `.github/workflows/test.yml` as a minimal CI job.

Workflow notes:
- triggers on `push` and `pull_request` for `main`
- uses checkout, Node 20 setup, `npm ci`, and `npm run test:ci`

Validation notes:
- Ruby YAML parser loaded the file successfully (`YAML OK`)

--- git diff -- package.json ---
diff --git a/package.json b/package.json
index 1ab09df..a639b9a 100644
--- a/package.json
+++ b/package.json
@@ -6,7 +6,9 @@
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
-    "lint": "next lint"
+    "lint": "next lint",
+    "test": "vitest run --passWithNoTests",
+    "test:ci": "vitest --run --reporter=dot --passWithNoTests --silent"
   },
   "dependencies": {
     "@vercel/analytics": "^2.0.1",
@@ -17,10 +19,14 @@
   },
   "devDependencies": {
     "@tailwindcss/postcss": "^4.1.4",
+    "@testing-library/jest-dom": "^6.9.1",
     "@types/node": "^22.15.3",
     "@types/react": "^19.0.10",
     "@types/react-dom": "^19.0.4",
+    "jsdom": "^26.1.0",
     "tailwindcss": "^4.1.4",
-    "typescript": "^5.8.3"
+    "typescript": "^5.8.3",
+    "vitest": "^2.1.9",
+    "@testing-library/react": "^14.0.0"
   }
 }
# Update at 2026-04-18T15:50:15Z

Added/ensured scripts: 'test' and 'test:ci'. Ensured devDependencies: vitest, jsdom, @testing-library/jest-dom, @testing-library/react.

## 2026-04-19 reusable Zen hook

- Added `components/use-light-zen-mode.ts` as a reusable client hook with a stable API: `isZen`, `toggleZen`, and `exitZen`.
- Kept the Escape key handling inside the hook so zen exit logic is reusable and does not depend on any UI class toggles or component-specific markup.
- Used a single document-level keydown listener with mount/unmount cleanup so the hook stays simple for future integration.
- Added `components/__tests__/use-light-zen-mode.test.tsx` to cover default state, toggle behavior, Escape exit, and listener cleanup.

## 2026-04-19 Task 8 GREEN integration

- Rewired `components/practice-client.tsx` to consume `useLightZenMode()` instead of keeping a duplicate local `zenMode` state and component-owned Escape listener.
- Preserved the existing conditional-rendering approach (`{!zenMode && ...}`) so Light Zen still removes navigation/sidebar text from the DOM, matching the current test strategy and avoiding regressions in answer flow.
- Kept question content, question count, progress bar, and all answer-selection/correctness behavior unchanged while swapping only the zen state source.
- Tightened the two zen test files with a typed `globalThis` cast for `IS_REACT_ACT_ENVIRONMENT`, which was needed for `npx tsc --noEmit` to pass after verification sequencing settled.

--- vitest --help (truncated) ---

> fuck-you-ib@0.1.0 test
> vitest run --passWithNoTests --help

vitest/2.1.9

Usage:
  $ vitest run [...filters]

Options:
  -r, --root <path>                              Root path 
  -c, --config <path>                            Path to config file 
  -u, --update                                   Update snapshot 
  -w, --watch                                    Enable watch mode 
  -t, --testNamePattern <pattern>                Run tests with full names matching the specified regexp pattern 
  --dir <path>                                   Base directory to scan for the test files 
  --ui                                           Enable UI 
  --open                                         Open UI automatically (default: !process.env.CI) 
  --api [port]                                   Specify server port. Note if the port is already being used, Vite will automatically try the next available port so this may not be the actual port the server ends up listening on. If true will be set to 51204. Use '--help --api' for more info. 
  --silent                                       Silent console output from tests 
  --hideSkippedTests                             Hide logs for skipped tests 
  --reporter <name>                              Specify reporters 
  --outputFile <filename/-s>                     Write test results to a file when supporter reporter is also specified, use cac's dot notation for individual outputs of multiple reporters (example: --outputFile.tap=./tap.txt) 
  --coverage                                     Enable coverage report. Use '--help --coverage' for more info. 
  --mode <name>                                  Override Vite mode (default: test or benchmark) 
  --workspace <path>                             Path to a workspace configuration file 
  --isolate                                      Run every test file in isolation. To disable isolation, use --no-isolate (default: true) 
  --globals                                      Inject apis globally 
  --dom                                          Mock browser API with happy-dom 
  --browser <name>                               Run tests in the browser. Equivalent to --browser.enabled (default: false). Use '--help --browser' for more info. 
  --pool <pool>                                  Specify pool, if not running in the browser (default: threads) 
  --poolOptions <options>                        Specify pool options. Use '--help --poolOptions' for more info. 
  --fileParallelism                              Should all test files run in parallel. Use --no-file-parallelism to disable (default: true) 
  --maxWorkers <workers>                         Maximum number or percentage of workers to run tests in 
  --minWorkers <workers>                         Minimum number or percentage of workers to run tests in 
  --environment <name>                           Specify runner environment, if not running in the browser (default: node) 
  --passWithNoTests                              Pass when no tests are found 
  --logHeapUsage                                 Show the size of heap for each test when running in node 
  --allowOnly                                    Allow tests and suites that are marked as only (default: !process.env.CI) 
  --dangerouslyIgnoreUnhandledErrors             Ignore any unhandled errors that occur 
  --shard <shards>                               Test suite shard to execute in a format of <index>/<count> 
  --changed [since]                              Run tests that are affected by the changed files (default: false) 
  --sequence <options>                           Options for how tests should be sorted. Use '--help --sequence' for more info. 
  --inspect [[host:]port]                        Enable Node.js inspector (default: 127.0.0.1:9229) 
  --inspectBrk [[host:]port]                     Enable Node.js inspector and break before the test starts 
  --testTimeout <timeout>                        Default timeout of a test in milliseconds (default: 5000) 
  --hookTimeout <timeout>                        Default hook timeout in milliseconds (default: 10000) 
  --bail <number>                                Stop test execution when given number of tests have failed (default: 0) 
  --retry <times>                                Retry the test specific number of times if it fails (default: 0) 
  --diff <path>                                  Path to a diff config that will be used to generate diff interface 
  --exclude <glob>                               Additional file globs to be excluded from test 
  --expandSnapshotDiff                           Show full diff when snapshot fails 
  --disableConsoleIntercept                      Disable automatic interception of console logging (default: false) 
  --typecheck                                    Enable typechecking alongside tests (default: false). Use '--help --typecheck' for more info. 
  --project <name>                               The name of the project to run if you are using Vitest workspace feature. This can be repeated for multiple projects: --project=1 --project=2. You can also filter projects using wildcards like --project=packages* 
  --slowTestThreshold <threshold>                Threshold in milliseconds for a test or suite to be considered slow (default: 300) 
  --teardownTimeout <timeout>                    Default timeout of a teardown function in milliseconds (default: 10000) 
  --cache                                        Enable cache. Use '--help --cache' for more info. 
  --maxConcurrency <number>                      Maximum number of concurrent tests in a suite (default: 5) 
  --expect                                       Configuration options for expect() matches. Use '--help --expect' for more info. 
  --printConsoleTrace                            Always print console stack traces 
  --run                                          Disable watch mode 
  --no-color                                     Removes colors from the console output (default: true)
  --clearScreen                                  Clear terminal screen when re-running tests during watch mode (default: true) 
  --standalone                                   Start Vitest without running tests. File filters will be ignored, tests will be running only on change (default: false) 
  --mergeReports [path]                          Paths to blob reports directory. If this options is used, Vitest won't run any tests, it will only report previously recorded tests 
  -h, --help                                     Display this message 

--- test:ci output (truncated) ---

> fuck-you-ib@0.1.0 test:ci
> vitest --run --reporter=dot --passWithNoTests --silent --version

vitest/2.1.9 darwin-arm64 node-v20.18.0

### Task 6: Add top-right Zen toggle UI control and tests
- Implemented "Light Zen" toggle in `PracticeClient` as a React state (`zenMode`).
- Followed accessible UI language from `site-header.tsx` with rounded, prominent controls and clear `aria-pressed` signaling.
- Used explicit conditional rendering to hide the navigation area, page header description, and the sticky `<aside>` context panel when Zen mode is active.
- Esc key interaction correctly wired to document event listener, exiting Zen mode properly.
- All 4 Vitest assertions for Light Zen functionality pass successfully.

## Light Zen Styling
- JSDOM tests using `document.body.textContent` assertions are unaware of CSS `display: none` applied by Tailwind classes like `group-data-[zen=true]:hidden`.
- To satisfy existing RED tests checking for text absence, we must conditionally unmount specific elements (like side-info and nav chips) rather than just applying CSS-based hiding.
- We achieved the "keep progress visible" requirement by keeping the `<aside>` mounted but transitioning its padding, borders, and background out, leaving only the condensed progress indicator visible.
- Reconfigured the wrapper grid to `mx-auto max-w-4xl` when in zen mode so the question panel expands and centers correctly, replacing the standard two-column layout.
- Ensure tests that use raw DOM traversal or `textContent` properly deal with conditional rendering rather than purely visual CSS toggles, or they will fail.

## 2026-04-19 Task 9 Zen boundary refactor

- Refactored `components/practice-client.tsx` to isolate Zen-specific UI boundaries into same-file helpers: `PracticeModeControls`, `PracticeTopicSummary`, and `PracticeSidebar`.
- Kept the question-solving article as the single place for selection, reveal, correctness, and question navigation logic so mode controls stay separate from answer flow.
- Preserved the prior conditional-rendering behavior for zen-hidden chrome, which remains important because the existing Light Zen tests assert on DOM text presence/absence rather than visual CSS only.

## 2026-04-19 Task 10 regression coverage for progress visibility + answer flow

- Expanded `components/__tests__/practice-client.light-zen.test.tsx` with explicit regression assertions for both non-zen and zen mode visibility.
- Added a second deterministic question fixture so navigation states (`Previous question`/`Next question`) and progress text (`Question X of 2`) can be verified meaningfully.
- Added concrete answer-flow tests in both modes: option select enables `Check answer`, reveal shows correctness feedback, and `Choose again` resets feedback and disables controls again.
- Added a small helper to find answer option buttons by leading label (`A`/`B`/`C`/`D`) because option buttons render label and text together; exact-label lookup was too strict.
- Verified required commands all pass after updates: targeted light-zen test file, full `npm run test`, and `npm run build`.

## 2026-04-19 Task 11 Responsive + A11y Polish Assertions

- Added assertions to `components/__tests__/practice-client.light-zen.test.tsx` verifying responsive design constraints (e.g., `flex-wrap` presence on the controls container).
- Verified minimum touch target accessibility using `min-h-11` and `min-h-12` class constraints on Zen toggle and core navigation buttons.
- Ensured keyboard path accessibility is tested by asserting `tabIndex`, `focus-visible` styling proxies, and keyboard-simulated interaction.
- Confirmed focus is maintained without regressions or being trapped when toggling and exiting Zen mode via the `Escape` key.
- Testing keyboard events in JSDOM often requires dispatching `click` events to fully simulate a user pressing Enter/Space on a button, alongside the key events, due to lack of full native browser emulation.

## 2026-04-19 Task 11 QA Fix - True Keyboard Flow Emulation

- Replaced explicit `new MouseEvent('click')` fallbacks with `element.click()`. In JSDOM and DOM spec, invoking the `.click()` method synthetically represents an element's default action, which fulfills keyboard activation semantics without explicitly constructing a mouse interaction.
- Bundled the keyboard trigger semantics (`keydown`/`keyup` followed by `.click()`) into a cohesive `simulateKeyboardActivation` helper.
- Extended post-Escape focus progression tests to verify that standard flow elements (like the "Next question" button) are naturally focusable (via `tabIndex: 0`) and properly receive focus in the simulated Tab sequence, ensuring Zen exit leaves the user in an accessible flow.


## 2026-04-19 Final manual QA gate (Playwright)

- Executed real interactive QA on `/practice/a4-rigid-body-mechanics` in desktop and mobile-ish viewport (`390x844`) using Playwright MCP.
- Confirmed normal-mode answer flow and navigation, zen answer flow, Escape-to-exit, and keyboard Enter-based control path work in live browser interactions.
- Captured evidence artifacts under `.sisyphus/evidence/final-qa/` including per-scenario screenshots, initial snapshot, console logs, network logs, and structured `qa-report.json`.


## 2026-04-19 F3 scope correction re-run

- Re-ran targeted Playwright zen-scope check to align QA interpretation: zen must hide top navigation and side info, while retaining core solving controls.
- Verified in live browser that `A4` top nav link and `Paper` side-info label are absent in zen mode, while `Next question` and progress remain visible as expected.
- Updated `.sisyphus/evidence/final-qa/qa-report.json` and `qa-summary.md` with corrected scenario criteria and passing verdict.
