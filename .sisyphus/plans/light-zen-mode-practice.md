# Light Zen Mode for Practice Flow

## TL;DR

> **Quick Summary**: Add a Light Zen Mode in practice pages so users can focus on the question itself by hiding top navigation and side info while keeping question/progress visible.
>
> **Deliverables**:
> - Zen toggle (top-right) + `Esc` exit in practice UI
> - Light Zen layout behavior (hide distraction chrome, preserve solving essentials)
> - Minimal test infrastructure + TDD coverage for Zen behavior
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves + final verification
> **Critical Path**: T1 → T4 → T8 → T10 → F1-F4

---

## Context

### Original Request
User asked to optimize experience with minimal changes and explicitly requested a ZEN MODE focused on solving questions.

### Interview Summary
**Key Discussions**:
- Search work was intentionally paused.
- User wants highest UX impact with smallest safe change.
- Zen scope selected: **Light Zen** (hide top nav + side info; keep progress visible).
- Interaction selected: **top-right toggle + `Esc` to exit**.
- Test strategy selected: **TDD**.

**Research Findings**:
- Practice experience is concentrated in `components/practice-client.tsx`.
- Practice route shell is `app/practice/[topic]/page.tsx`.
- Current repo has no automated test framework/scripts/workflow.

### Metis Review
**Identified Gaps** (addressed):
- Metis tool invocation repeatedly failed in this environment (auto-abort).
- Manual fallback gap analysis applied in this plan:
  - Explicitly lock scope to Light Zen only.
  - Explicitly prevent scope creep into search, persistence, or cross-page redesign.
  - Add detailed acceptance criteria + mandatory QA scenarios for keyboard and responsive behavior.

---

## Work Objectives

### Core Objective
Introduce a distraction-reduced Light Zen mode for practice solving with minimal UI surface changes and strong regression safety via TDD.

### Concrete Deliverables
- Practice UI supports Zen mode toggle and `Esc` exit.
- In Zen mode, non-essential chrome is hidden/reduced while question/progress remains visible.
- Automated tests exist for mode state transitions and key behavior.
- CI test job exists for repeatable verification.

### Definition of Done
- [x] `npm run test` passes with new Zen tests.
- [x] `npm run build` passes.
- [x] Manual QA evidence confirms Light Zen behavior across desktop/mobile and keyboard flow.

### Must Have
- Light Zen only on practice view (`/practice/[topic]`).
- Top-right toggle and `Esc` exit.
- Keep question indicator/progress visible in Zen mode.
- No impact on question-answer correctness flow.

### Must NOT Have (Guardrails)
- No new paid services or backend architecture.
- No global redesign of homepage/review routes.
- No scope expansion to search features.
- No persistence requirement (no remembered preference) in this iteration.

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: TDD
- **Framework**: Vitest + Testing Library (to be added in this plan)
- **TDD flow**: RED (Zen behavior tests fail) → GREEN (minimal implementation) → REFACTOR

### QA Policy
Evidence stored under `.sisyphus/evidence/`.

- **Frontend/UI**: Playwright for interaction and visibility assertions
- **CLI/Build**: Bash for `npm run test`, `npm run build`
- **Behavior**: Keyboard (`Esc`) and responsive checks included in each relevant task

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - test infra):
├── Task 1: Add test scripts/dependencies in package.json [quick]
├── Task 2: Add Vitest config + setup file [quick]
└── Task 3: Add CI test workflow [quick]

Wave 2 (TDD specs + Zen primitives):
├── Task 4: RED tests for Light Zen behavior in practice flow [unspecified-high]
├── Task 5: Add reusable Zen state/keyboard hook + unit tests [quick]
├── Task 6: Add Zen toggle UI component + interaction tests [visual-engineering]
├── Task 7: Add Light Zen styling utilities [visual-engineering]
└── Task 8: Integrate Zen behavior into PracticeClient (GREEN) [deep]

Wave 3 (Refactor + hardening):
├── Task 9: Refactor PracticeClient for clear Zen boundaries [deep]
├── Task 10: Add regression tests for progress visibility and answer flow [unspecified-high]
└── Task 11: Add responsive/accessibility polish assertions [visual-engineering]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA execution (unspecified-high)
└── Task F4: Scope fidelity check (deep)
```

Critical Path: T1 → T4 → T8 → T10 → F1-F4 → user okay

### Dependency Matrix (Full)

- **1**: Blocked By: None | Blocks: 4, 5, 6, 10, 11
- **2**: Blocked By: None | Blocks: 4, 5, 6, 10, 11
- **3**: Blocked By: 1 | Blocks: FINAL confidence gates (non-blocking for implementation)
- **4**: Blocked By: 1, 2 | Blocks: 8
- **5**: Blocked By: 1, 2 | Blocks: 8, 9
- **6**: Blocked By: 1, 2 | Blocks: 8
- **7**: Blocked By: None | Blocks: 8, 11
- **8**: Blocked By: 4, 5, 6, 7 | Blocks: 9, 10, 11
- **9**: Blocked By: 5, 8 | Blocks: 10, FINAL
- **10**: Blocked By: 1, 2, 8, 9 | Blocks: FINAL
- **11**: Blocked By: 1, 2, 7, 8 | Blocks: FINAL

### Agent Dispatch Summary

- **Wave 1**: T1→`quick`, T2→`quick`, T3→`quick`
- **Wave 2**: T4→`unspecified-high`, T5→`quick`, T6→`visual-engineering`, T7→`visual-engineering`, T8→`deep`
- **Wave 3**: T9→`deep`, T10→`unspecified-high`, T11→`visual-engineering`
- **FINAL**: F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

- [x] 1. Add minimal test scripts and dependencies

  **What to do**:
  - Add `test` and `test:ci` scripts in `package.json`.
  - Add minimal dev dependencies for Vitest + React Testing Library + jsdom.
  - Ensure scripts run in repo CI/non-interactive mode.

  **Must NOT do**:
  - Do not add e2e-heavy frameworks (Cypress/Playwright tests) at this stage.
  - Do not alter runtime dependencies unrelated to testing.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: focused single-file config update.
  - **Skills**: [`test-driven-development`]
    - `test-driven-development`: ensures test-first flow from first infra task.
  - **Skills Evaluated but Omitted**:
    - `verification-before-completion`: used later in final verification wave.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: 4, 5, 6, 10, 11
  - **Blocked By**: None

  **References**:
  - `package.json` - current scripts/deps baseline to extend.
  - `AGENTS.md` - project command conventions (`npm run build`, app workflow).

  **Acceptance Criteria**:
  - [ ] `npm run test -- --help` executes without script-not-found.
  - [ ] `package.json` contains explicit `test` and `test:ci` scripts.

  **QA Scenarios**:
  ```
  Scenario: test scripts are wired
    Tool: Bash
    Preconditions: dependency install completed
    Steps:
      1. Run: npm run test -- --runInBand=false
      2. Run: npm run test:ci -- --version (or runner equivalent)
      3. Assert both commands resolve to test runner invocation
    Expected Result: commands execute without "missing script"
    Failure Indicators: npm ERR! Missing script: "test" or "test:ci"
    Evidence: .sisyphus/evidence/task-1-test-scripts.txt

  Scenario: unrelated runtime deps untouched
    Tool: Bash
    Preconditions: task changes applied
    Steps:
      1. Run: git diff -- package.json
      2. Inspect changed sections are scripts + devDependencies only
    Expected Result: no runtime dependency churn
    Evidence: .sisyphus/evidence/task-1-runtime-deps-check.txt
  ```

  **Commit**: YES (groups with 2)

- [x] 2. Add Vitest config and setup baseline

  **What to do**:
  - Add `vitest.config.*` for jsdom test environment.
  - Add setup file for `@testing-library/jest-dom`.
  - Include coverage output directory mapping to existing `.gitignore` convention.

  **Must NOT do**:
  - Do not enforce aggressive coverage threshold in first pass.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: limited config files.
  - **Skills**: [`test-driven-development`]
    - `test-driven-development`: ensures RED/GREEN bootstrap correctly.
  - **Skills Evaluated but Omitted**:
    - `writing-plans`: already in plan phase.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: 4, 5, 6, 10, 11
  - **Blocked By**: None

  **References**:
  - `.gitignore` - contains `/coverage`, align test coverage output.
  - `components/practice-client.tsx` - React component requiring jsdom environment.

  **Acceptance Criteria**:
  - [ ] Vitest config file exists and loads.
  - [ ] Setup file enables RTL matchers (e.g., `toBeInTheDocument`).

  **QA Scenarios**:
  ```
  Scenario: vitest config loads successfully
    Tool: Bash
    Preconditions: config file created
    Steps:
      1. Run: npm run test -- --reporter=verbose
      2. Assert no config parse/runtime error
    Expected Result: test runner starts and reports test discovery
    Failure Indicators: "Failed to load config" / "Unknown test environment"
    Evidence: .sisyphus/evidence/task-2-vitest-config.txt

  Scenario: jest-dom setup active
    Tool: Bash
    Preconditions: at least one test uses RTL matcher
    Steps:
      1. Run test file using `toBeInTheDocument`
      2. Assert matcher is recognized
    Expected Result: no matcher undefined errors
    Evidence: .sisyphus/evidence/task-2-jest-dom-setup.txt
  ```

  **Commit**: YES (groups with 1)

- [x] 3. Add CI workflow for automated test execution

  **What to do**:
  - Add `.github/workflows/test.yml` running `npm ci` + `npm run test:ci`.
  - Trigger on pull requests and pushes to main branch.

  **Must NOT do**:
  - Do not add deployment logic in this workflow.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: one workflow file.
  - **Skills**: [`verification-before-completion`]
    - `verification-before-completion`: CI command validity before claiming done.
  - **Skills Evaluated but Omitted**:
    - `gh-cli`: not required for local workflow definition.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: final confidence gates
  - **Blocked By**: 1

  **References**:
  - `package.json` - source of test scripts used by CI.

  **Acceptance Criteria**:
  - [ ] Workflow file exists and references valid script (`test:ci`).
  - [ ] YAML syntax passes local lint/parsing check if available.

  **QA Scenarios**:
  ```
  Scenario: workflow references valid scripts
    Tool: Bash
    Preconditions: workflow file added
    Steps:
      1. Read workflow steps
      2. Confirm commands include npm ci and npm run test:ci
    Expected Result: no stale/nonexistent script references
    Evidence: .sisyphus/evidence/task-3-workflow-script-check.txt

  Scenario: workflow trigger correctness
    Tool: Bash
    Preconditions: workflow added
    Steps:
      1. Validate YAML includes push + pull_request triggers
      2. Confirm target branches include main
    Expected Result: workflow would run on normal contribution flow
    Evidence: .sisyphus/evidence/task-3-workflow-trigger-check.txt
  ```

  **Commit**: NO

- [x] 4. Write RED tests for Light Zen behavior in practice UI

  **What to do**:
  - Add failing tests describing Light Zen expectations:
    - toggle enables/disables mode
    - top nav/side info hidden in Zen
    - question/progress remains visible
    - `Esc` exits Zen
  - Keep tests focused on user-visible behavior.

  **Must NOT do**:
  - Do not implement production Zen behavior in this task.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: behavior-driven test spec across complex component.
  - **Skills**: [`test-driven-development`]
    - `test-driven-development`: explicit RED phase.
  - **Skills Evaluated but Omitted**:
    - `visual-engineering`: implementation comes later.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 5, 6, 7)
  - **Blocks**: 8
  - **Blocked By**: 1, 2

  **References**:
  - `components/practice-client.tsx` - target behavior location.
  - `app/practice/[topic]/page.tsx` - parent route contract for props.

  **Acceptance Criteria**:
  - [ ] New Zen tests exist and fail for expected missing behavior.
  - [ ] Failures are specific (not generic runtime crashes).

  **QA Scenarios**:
  ```
  Scenario: RED phase shows expected failures
    Tool: Bash
    Preconditions: tests added, implementation unchanged
    Steps:
      1. Run: npm run test -- practice-client
      2. Assert failures reference zen toggle/visibility/esc expectations
    Expected Result: tests fail for missing zen behavior only
    Failure Indicators: passing unexpectedly or unrelated fatal errors
    Evidence: .sisyphus/evidence/task-4-red-test-output.txt

  Scenario: no accidental implementation in RED task
    Tool: Bash
    Preconditions: task complete
    Steps:
      1. Run: git diff
      2. Ensure only test files changed
    Expected Result: production files unchanged in RED step
    Evidence: .sisyphus/evidence/task-4-red-scope-check.txt
  ```

  **Commit**: NO

- [x] 5. Add reusable Zen state + keyboard hook with unit tests

  **What to do**:
  - Implement hook (e.g., `useZenMode`) handling toggle and `Esc` exit.
  - Add unit tests for default state, toggle, and cleanup behavior.

  **Must NOT do**:
  - Do not directly mutate DOM class names outside React state flow.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: isolated logic module.
  - **Skills**: [`test-driven-development`]
    - `test-driven-development`: validate hook behavior deterministically.
  - **Skills Evaluated but Omitted**:
    - `systematic-debugging`: only if tests become flaky.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 4, 6, 7)
  - **Blocks**: 8, 9
  - **Blocked By**: 1, 2

  **References**:
  - `components/practice-client.tsx` - current stateful patterns to align style.

  **Acceptance Criteria**:
  - [ ] Hook exposes predictable API (`isZen`, `toggleZen`, `exitZen`).
  - [ ] `Esc` key exits only when Zen is active.

  **QA Scenarios**:
  ```
  Scenario: keyboard behavior unit-tested
    Tool: Bash
    Preconditions: hook tests added
    Steps:
      1. Run hook test file
      2. Simulate keydown Escape
      3. Assert state false after Escape when previously true
    Expected Result: deterministic pass
    Evidence: .sisyphus/evidence/task-5-hook-keyboard-test.txt

  Scenario: listener cleanup
    Tool: Bash
    Preconditions: hook mounts/unmounts in test
    Steps:
      1. Unmount component using hook
      2. Fire Escape
      3. Assert no state update warnings/errors
    Expected Result: no memory-leak warning
    Evidence: .sisyphus/evidence/task-5-hook-cleanup.txt
  ```

  **Commit**: NO

- [x] 6. Add top-right Zen toggle UI control and tests

  **What to do**:
  - Add a clearly-labeled toggle/button in practice view top-right area.
  - Ensure accessible label and focus-visible states.
  - Add tests for click/tap state transitions.

  **Must NOT do**:
  - Do not move unrelated navigation IA.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: interaction + style + accessibility.
  - **Skills**: [`frontend-design`]
    - `frontend-design`: maintain visual language consistency.
  - **Skills Evaluated but Omitted**:
    - `ui-ux-pro-max`: unnecessary for this small control.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 4, 5, 7)
  - **Blocks**: 8
  - **Blocked By**: 1, 2

  **References**:
  - `components/practice-client.tsx:70-97` - existing top action area where control should live.
  - `components/site-header.tsx` - button style language reference.

  **Acceptance Criteria**:
  - [ ] Zen toggle visible in practice top controls.
  - [ ] Toggle has accessible name and keyboard focus support.

  **QA Scenarios**:
  ```
  Scenario: toggle button appears and toggles
    Tool: Playwright
    Preconditions: run dev server
    Steps:
      1. Open /practice/a4-rigid-body-mechanics
      2. Locate button by role name containing "Zen"
      3. Click once and assert active visual state
      4. Click again and assert inactive state
    Expected Result: two-way toggle works
    Evidence: .sisyphus/evidence/task-6-toggle-ui.png

  Scenario: keyboard activation
    Tool: Playwright
    Preconditions: page focused
    Steps:
      1. Tab to Zen toggle
      2. Press Enter/Space
      3. Assert mode state changes
    Expected Result: keyboard users can toggle mode
    Evidence: .sisyphus/evidence/task-6-toggle-keyboard.png
  ```

  **Commit**: NO

- [x] 7. Add Light Zen styling utilities

  **What to do**:
  - Define conditional classes/variants for zen-on layout state.
  - Hide/de-emphasize top nav chips and side info cards in Zen.
  - Preserve central question card readability and spacing.

  **Must NOT do**:
  - Do not change design tokens globally.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: targeted layout/polish task.
  - **Skills**: [`frontend-design`]
    - `frontend-design`: preserves existing aesthetic.
  - **Skills Evaluated but Omitted**:
    - `vercel-react-best-practices`: no perf-sensitive rendering change expected.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 4, 5, 6)
  - **Blocks**: 8, 11
  - **Blocked By**: None

  **References**:
  - `components/practice-client.tsx:117-157` - sidebar blocks to hide in Zen.
  - `components/practice-client.tsx:158-289` - primary question panel to keep.

  **Acceptance Criteria**:
  - [ ] Zen mode visually removes/reduces distractions defined in Light scope.
  - [ ] Progress text remains visible somewhere in main panel.

  **QA Scenarios**:
  ```
  Scenario: sidebar hidden in zen
    Tool: Playwright
    Preconditions: zen enabled
    Steps:
      1. Open practice route
      2. Enable zen
      3. Assert sidebar container is hidden/collapsed
    Expected Result: no side info cards visible
    Evidence: .sisyphus/evidence/task-7-sidebar-hidden.png

  Scenario: progress remains visible
    Tool: Playwright
    Preconditions: zen enabled
    Steps:
      1. Enable zen
      2. Assert text matching /Question \d+ of \d+/ exists
    Expected Result: progress still visible
    Evidence: .sisyphus/evidence/task-7-progress-visible.png
  ```

  **Commit**: NO

- [x] 8. Integrate Zen mode into PracticeClient (GREEN)

  **What to do**:
  - Wire hook + toggle + style variants into `PracticeClient`.
  - Ensure core solving flow unchanged: select option, check answer, nav prev/next.
  - Make RED tests from Task 4 pass.

  **Must NOT do**:
  - Do not alter question data transformation logic (`normalizeOptions`, correctness rules).

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: integration task touching multiple UI states.
  - **Skills**: [`test-driven-development`, `frontend-design`]
    - `test-driven-development`: GREEN completion target.
    - `frontend-design`: maintain polish while integrating.
  - **Skills Evaluated but Omitted**:
    - `systematic-debugging`: only needed if regressions emerge.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: 9, 10, 11
  - **Blocked By**: 4, 5, 6, 7

  **References**:
  - `components/practice-client.tsx` - primary integration file.
  - `lib/rich-text.ts` - ensure rendered content path unchanged.

  **Acceptance Criteria**:
  - [ ] RED tests now pass.
  - [ ] Zen mode toggles without breaking answer reveal flow.

  **QA Scenarios**:
  ```
  Scenario: complete happy-path in zen
    Tool: Playwright
    Preconditions: zen integrated
    Steps:
      1. Open /practice/a4-rigid-body-mechanics
      2. Enable zen
      3. Select option button "A" (or first rendered)
      4. Click "Check answer"
      5. Assert feedback panel appears
    Expected Result: answer workflow works in zen
    Evidence: .sisyphus/evidence/task-8-zen-answer-flow.png

  Scenario: Esc exits zen
    Tool: Playwright
    Preconditions: zen enabled
    Steps:
      1. Press Escape
      2. Assert sidebar/top info return
    Expected Result: zen disabled and full layout restored
    Evidence: .sisyphus/evidence/task-8-esc-exit.png
  ```

  **Commit**: YES

- [x] 9. Refactor PracticeClient Zen boundaries for maintainability

  **What to do**:
  - Extract Zen-related conditional rendering into clear sections/helpers.
  - Keep file readable by separating concerns: mode controls vs question logic.

  **Must NOT do**:
  - Do not introduce unrelated behavior changes.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: safe refactor in large component.
  - **Skills**: [`test-driven-development`]
    - `test-driven-development`: protects against refactor regressions.
  - **Skills Evaluated but Omitted**:
    - `refactor` command skill: not mandatory for this scope.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: 10
  - **Blocked By**: 5, 8

  **References**:
  - `components/practice-client.tsx:69-294` - current mixed concerns to untangle.

  **Acceptance Criteria**:
  - [ ] Zen-specific branches are clearly isolated.
  - [ ] Existing tests remain green after refactor.

  **QA Scenarios**:
  ```
  Scenario: regression test suite remains green after refactor
    Tool: Bash
    Preconditions: refactor complete
    Steps:
      1. Run: npm run test
      2. Verify zen and answer-flow tests pass
    Expected Result: no behavior regression
    Evidence: .sisyphus/evidence/task-9-refactor-tests.txt

  Scenario: no scope creep in refactor
    Tool: Bash
    Preconditions: diff available
    Steps:
      1. Run: git diff
      2. Ensure only practice client / zen-related files changed
    Expected Result: refactor limited to planned scope
    Evidence: .sisyphus/evidence/task-9-scope-check.txt
  ```

  **Commit**: NO

- [x] 10. Add regression tests for progress visibility and answer flow

  **What to do**:
  - Add tests ensuring question/progress is visible in both Zen and normal mode.
  - Add tests ensuring `Check answer`, `Choose again`, next/prev continue to work.

  **Must NOT do**:
  - Do not loosen existing assertions into vague snapshots.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: critical behavior safety net.
  - **Skills**: [`test-driven-development`]
    - `test-driven-development`: lock regression boundaries.
  - **Skills Evaluated but Omitted**:
    - `verification-before-completion`: applied globally later.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: FINAL
  - **Blocked By**: 1, 2, 8, 9

  **References**:
  - `components/practice-client.tsx:127,163` - progress text anchors.
  - `components/practice-client.tsx:238-288` - answer action flow.

  **Acceptance Criteria**:
  - [ ] Regression suite covers Zen + non-Zen progress visibility.
  - [ ] Regression suite covers answer interaction controls.

  **QA Scenarios**:
  ```
  Scenario: progress visibility both modes
    Tool: Bash
    Preconditions: tests authored
    Steps:
      1. Run targeted practice-client tests
      2. Assert tests for normal + zen progress pass
    Expected Result: deterministic pass
    Evidence: .sisyphus/evidence/task-10-progress-tests.txt

  Scenario: answer controls unaffected
    Tool: Playwright
    Preconditions: app running
    Steps:
      1. In normal mode, choose option and check answer
      2. In zen mode, repeat same flow
      3. Assert feedback appears both cases
    Expected Result: identical behavior except chrome visibility
    Evidence: .sisyphus/evidence/task-10-answer-controls.png
  ```

  **Commit**: YES

- [x] 11. Add responsive + accessibility polish assertions for Zen

  **What to do**:
  - Validate Zen toggle and essential controls on mobile viewport.
  - Ensure keyboard-only path: tab to toggle, `Esc` exits, focus remains usable.

  **Must NOT do**:
  - Do not redesign component hierarchy for responsive rewrite.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: interaction polish and a11y verification.
  - **Skills**: [`frontend-design`]
    - `frontend-design`: maintain design consistency under responsive constraints.
  - **Skills Evaluated but Omitted**:
    - `ui-ux-pro-max`: unnecessary for narrow polish scope.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with 9, 10)
  - **Blocks**: FINAL
  - **Blocked By**: 1, 2, 7, 8

  **References**:
  - `components/practice-client.tsx` - viewport behavior and control layout.

  **Acceptance Criteria**:
  - [ ] Zen toggle reachable and visible at common mobile width.
  - [ ] `Esc` and keyboard flow remain functional without focus traps.

  **QA Scenarios**:
  ```
  Scenario: mobile viewport zen usability
    Tool: Playwright
    Preconditions: viewport 390x844
    Steps:
      1. Open practice page at mobile size
      2. Enable zen
      3. Assert toggle and answer controls are visible and clickable
    Expected Result: core flow usable on mobile
    Evidence: .sisyphus/evidence/task-11-mobile-zen.png

  Scenario: keyboard focus path
    Tool: Playwright
    Preconditions: desktop viewport
    Steps:
      1. Use Tab to reach Zen toggle
      2. Activate toggle via keyboard
      3. Press Esc to exit
      4. Continue tab navigation to action buttons
    Expected Result: no keyboard trap; controls remain accessible
    Evidence: .sisyphus/evidence/task-11-keyboard-path.png
  ```

  **Commit**: NO

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [x] F1. **Plan Compliance Audit** — `oracle`
  Validate each Must Have / Must NOT Have against changed files and evidence.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run type/lint/test/build; inspect changed files for slop patterns and regressions.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright`)
  Execute every scenario from every task and capture artifacts to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge cases [N] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  Confirm changes are limited to Light Zen scope and test infra additions.
  Output: `Tasks [N/N compliant] | Scope creep [0 issues expected] | VERDICT`

---

## Commit Strategy

- **Commit 1**: `test(setup): add vitest and CI baseline`
  - Files: package.json, vitest config/setup, CI workflow
  - Pre-commit: `npm run test` (baseline)

- **Commit 2**: `feat(practice): add light zen mode toggle and esc exit`
  - Files: practice client + zen UI/hook/styles
  - Pre-commit: `npm run test && npm run build`

- **Commit 3**: `test(practice): add regression coverage for zen behavior`
  - Files: practice-related tests
  - Pre-commit: `npm run test && npm run build`

---

## Success Criteria

### Verification Commands
```bash
npm run test   # Expected: all tests pass including zen behavior suite
npm run build  # Expected: production build succeeds without regressions
```

### Final Checklist
- [x] Light Zen toggle exists in practice UI top-right
- [x] `Esc` exits Zen mode reliably
- [x] Top nav and side info hidden in Zen mode
- [x] Question/progress remains visible in Zen mode
- [x] Non-Zen behavior unchanged when Zen is off
- [x] Automated tests + CI test workflow added
