import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import type { QuestionRecord } from '@/lib/types';

const preparedQuestionsDir = path.join(process.cwd(), 'prepared-questions');

export const listPreparedQuestionFiles = cache(async () => {
  const entries = await fs.readdir(preparedQuestionsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort();
});

export const loadQuestionSet = cache(async (fileName: string): Promise<QuestionRecord[]> => {
  const fullPath = path.join(preparedQuestionsDir, fileName);
  const raw = await fs.readFile(fullPath, 'utf8');
  const parsed = JSON.parse(raw) as QuestionRecord[];
  return Array.isArray(parsed) ? parsed : [];
});

export function getTopicDescription(topicCode: string, displayName: string) {
  const byCode: Record<string, string> = {
    A4: 'Rotational equilibrium, torque, and rigid-body reasoning from extracted paper images.',
    B1: 'Thermal energy transfer questions for quick multiple-choice drilling and review.',
  };

  return byCode[topicCode] ?? `${displayName} questions generated from the extraction pipeline.`;
}
