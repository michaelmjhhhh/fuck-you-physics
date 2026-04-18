# IB Physics Schema MVP

This MVP locks the ingest contract before bulk digitization. It gives you one canonical JSON shape for extracted questions and one SQLite schema for persistent storage.

## Files

- `schema.sql` — SQLite schema for topics, papers, questions, and options.
- `sample-question.json` — canonical question object for extraction output.
- Existing source folders:
  - `A4-Rigid-Body-Mechanics/`
  - `B1-Thermal-Energy-Transfers/`

## Current assumptions

1. The current corpus is Paper 1 style MCQ images.
2. The answer key comes from the trailing filename letter.
   - Example: `May 2022 HL TZ1 Q10 A.png` → correct answer is `A`.
3. Topic identity comes from the folder name.
   - `A4-Rigid-Body-Mechanics/` → topic code `A4`, topic `Rigid Body Mechanics`
   - `B1-Thermal-Energy-Transfers/` → topic code `B1`, topic `Thermal Energy Transfers`
4. Every extracted question should preserve LaTeX-ready markdown and diagram placeholders.

## Filename normalization

Use the filename to derive paper metadata.

### Supported examples

- `May 2022 HL TZ1 Q10 A.png`
- `Nov 2016 HL Q25 A.png`
- `Specimen Paper 2025 HL Q4 D.png`

### Parsing rules

- `year`: the 4-digit year in the filename.
- `exam_month`:
  - `May` for files beginning with `May`
  - `Nov` for files beginning with `Nov`
  - `Specimen` for files beginning with `Specimen Paper`
- `level`: `HL` or `SL`
- `timezone`: optional token such as `TZ0`, `TZ1`, or `TZ2`
- `question_number`: the integer after `Q`
- `correct_answer`: the trailing single letter before `.png`

## Canonical JSON contract

The extractor should emit JSON shaped like `sample-question.json`.

### Required top-level fields

- `id`
- `topic`
- `topic_code`
- `sub_topic`
- `paper`
- `question_number`
- `content_markdown`
- `has_diagram`
- `diagram_metadata`
- `options`
- `correct_answer`
- `vibe_explanation`

### Notes

- `content_markdown` should use LaTeX for variables, units, and equations.
- `diagram_metadata.labels_to_preserve` should contain OCR-critical labels for downstream OpenCV handling.
- `vibe_explanation` stays short and conceptual.

## SQLite mapping

### `topics`

Stable topic dictionary. For the MVP, only the two real topics are seeded.

### `papers`

One row per paper/session/source combination. This keeps session metadata normalized and reusable across many questions.

### `questions`

Stores the extracted question body, diagram metadata, answer key, and source tracking.

### `question_options`

Stores answer options separately so ordering is explicit and queryable.

## Import order

1. Ensure the topic exists in `topics`.
2. Upsert the normalized paper row into `papers`.
3. Insert the extracted question into `questions`.
4. Insert four ordered rows into `question_options`.

## First real backend step after this

Build a tiny importer that:

1. walks the topic folders,
2. parses filename metadata,
3. reads extracted JSON,
4. inserts records into SQLite using `schema.sql`.
