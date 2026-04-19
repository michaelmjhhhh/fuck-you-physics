# Draft: /start-work Model Routing Fix

## Requirements (confirmed)
- User wants `/start-work` to run using `github-copilot/gpt-5.3-codex`.
- Current blocker error: `Model not found: github-copilot/claude-sonnet-4.6`.

## Technical Decisions
- Keep execution model explicitly pinned to `github-copilot/gpt-5.3-codex`.
- Treat this as executor configuration fix, not feature implementation.

## Research Findings
- Repository search did not find `claude-sonnet-4.6` references.
- Likely source is external agent/runtime config (outside current repo files).
- Root cause confirmed in local config: `/Users/michael/.config/opencode/oh-my-openagent.json` contains `github-copilot/claude-sonnet-4.6` as primary model in several entries:
  - `agents.atlas.model`
  - `agents.sisyphus-junior.model`
  - `categories.unspecified-low.model`
  - `categories.unspecified-high.model`
  - `categories.writing.fallback_models[*].model`

## Recommended Fix
- Replace every `github-copilot/claude-sonnet-4.6` with `github-copilot/gpt-5.3-codex` in `/Users/michael/.config/opencode/oh-my-openagent.json`.
- Then re-run `/start-work`.

## Open Questions
- Exact config location for `/start-work` model mapping.
- Whether model override is CLI flag or config-file based in your environment.

## Scope Boundaries
- INCLUDE: minimal change to execution model routing.
- EXCLUDE: any product code changes.
