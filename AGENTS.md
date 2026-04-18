# AGENTS.md

## One-click pipeline for new images

When new `.png` question images are added to topic folders (for example `A4-Rigid-Body-Mechanics/`, `B1-Thermal-Energy-Transfers/`), run one command from repo root.

The pipeline now does this automatically in one run:

1. Regenerate manifests from current image folders.
2. Run LLM extraction on selected scope (`a4` / `b1` / `b2` / `b3` / `b4` / `b5` / `c1` / `c2` / `c4` / `c5` / `d1` / `all`).
3. Auto-retry failed items up to 3 times.
4. Build importable JSON set (excluding reports).
5. Import extracted questions into SQLite (`ib_physics.db`).
6. Replace web JSON data files used by the Next.js practice routes.

## Frontend app workflow

The primary frontend is now the Next.js + TypeScript app in this repo root.

### Development

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/` — syllabus homepage
- `http://localhost:3000/practice/a4-rigid-body-mechanics`
- `http://localhost:3000/practice/b1-thermal-energy-transfers`
- `http://localhost:3000/practice/b2-greenhouse-effect`
- `http://localhost:3000/practice/d1-gravitational-field`
- `http://localhost:3000/review` — review workflow status page

### Production build check

```bash
npm run build
npm run start
```

## Frontend architecture notes

- Next app routes live under `app/`
- Topic metadata and syllabus grouping live in `lib/topics.ts`
- Question loading lives in `lib/questions.ts`
- Topic sections are derived from the first letter of `topic_code`
  - `A4` → section `A`
  - `B1` → section `B`
- Source images are served from `public/`

## Required setup

Create `.env` in repo root with at least one key:

```env
SILICONROUTER_API_KEY=your_key_here
# OR
OPENAI_API_KEY=your_key_here
```

## One-command runs

### All topics (recommended default)

```bash
./run_pipeline.sh all Gemini-3-flash-preview https://api.siliconrouter.com/v1 import
```

### A4 only

```bash
./run_pipeline.sh a4 Gemini-3-flash-preview https://api.siliconrouter.com/v1 import
```

### B1 only

```bash
./run_pipeline.sh b1 Gemini-3-flash-preview https://api.siliconrouter.com/v1 import
```

### B2 only

```bash
./run_pipeline.sh b2 Gemini-3-flash-preview https://api.siliconrouter.com/v1 import
```

### D1 only

```bash
./run_pipeline.sh d1 Gemini-3-flash-preview https://api.siliconrouter.com/v1 import
```

### Extraction only (no DB import)

```bash
./run_pipeline.sh all Gemini-3-flash-preview https://api.siliconrouter.com/v1 noimport
```

## Script arguments

```bash
./run_pipeline.sh <topic> <model> <api_base> <import_flag>
```

- `topic`: `a4` | `b1` | `b2` | `b3` | `b4` | `b5` | `c1` | `c2` | `c4` | `c5` | `d1` | `all`
- `model`: any OpenAI-compatible model name
- `api_base`: OpenAI-compatible base URL
- `import_flag`: `import` | `noimport`

## Outputs

- Raw extracted JSON:
  - `prepared-questions/llm-extracted-<topic>/`
- Importable JSON:
  - `prepared-questions/llm-extracted-<topic>-importable/`
- Web data replaced:
  - `prepared-questions/a4-rigid-body-mechanics.json`
  - `prepared-questions/b1-thermal-energy-transfers.json`
  - `prepared-questions/b2-greenhouse-effect.json`
  - `prepared-questions/d1-gravitational-field.json`
- SQLite database:
  - `ib_physics.db`

## Notes

- The pipeline is designed for incremental operation with newly added images because manifests are regenerated every run.
- If one item still fails after retries due to model output format, rerun with a fallback model for that item (or rerun full pipeline with a different model).
