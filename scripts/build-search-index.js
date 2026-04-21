#!/usr/bin/env node
const { promises: fs } = require('node:fs');
const path = require('node:path');

const preparedQuestionsDir = path.join(process.cwd(), 'prepared-questions');
const outputPath = path.join(process.cwd(), 'public', 'search-index.json');

async function buildSearchIndex() {
  const entries = await fs.readdir(preparedQuestionsDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name);

  const allItems = [];

  for (const file of files) {
    const fullPath = path.join(preparedQuestionsDir, file);
    const raw = await fs.readFile(fullPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const practiceSlug = file.replace(/\.json$/i, '');
      for (const question of parsed) {
        allItems.push({
          id: question.id,
          topic: question.topic,
          topic_code: question.topic_code,
          sub_topic: question.sub_topic,
          question_number: question.question_number,
          content_markdown: question.content_markdown,
          correct_answer: question.correct_answer,
          paper_year: question.paper.year,
          paper_month: question.paper.month,
          paper_level: question.paper.level,
          practice_slug: practiceSlug,
        });
      }
    }
  }

  return allItems;
}

async function main() {
  const index = await buildSearchIndex();
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(index, null, 2));
  console.log(`Generated ${outputPath} with ${index.length} items`);
}

main().catch(console.error);