import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { SearchIndexItem } from '@/lib/search-types';
import type { QuestionRecord } from '@/lib/types';

const preparedQuestionsDir = path.join(process.cwd(), 'prepared-questions');

export async function buildSearchIndex(): Promise<SearchIndexItem[]> {
  const entries = await fs.readdir(preparedQuestionsDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name);

  const allItems: SearchIndexItem[] = [];

  for (const file of files) {
    const fullPath = path.join(preparedQuestionsDir, file);
    const raw = await fs.readFile(fullPath, 'utf8');
    const parsed = JSON.parse(raw) as QuestionRecord[];
    if (Array.isArray(parsed)) {
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
        });
      }
    }
  }

  return allItems;
}