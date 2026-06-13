import { describe, expect, it } from 'vitest';
import { listPreparedQuestionFiles, loadQuestionSet } from '../questions';
import { getTopics } from '../topics';

describe('generated practice route integrity', () => {
  it('maps every non-empty prepared question file to one topic route', async () => {
    const files = await listPreparedQuestionFiles();
    const topics = await getTopics();
    const topicSlugs = new Set(topics.map((topic) => topic.slug));

    const nonEmptySlugs: string[] = [];

    for (const fileName of files) {
      const questions = await loadQuestionSet(fileName);
      if (questions.length > 0) {
        nonEmptySlugs.push(fileName.replace(/\.json$/i, ''));
      }
    }

    expect(nonEmptySlugs.length).toBeGreaterThan(0);
    expect([...topicSlugs].sort()).toEqual(nonEmptySlugs.sort());
  });

  it('uses dataset lengths for visible topic counts', async () => {
    const topics = await getTopics();

    for (const topic of topics) {
      const questions = await loadQuestionSet(`${topic.slug}.json`);
      expect(topic.questionCount).toBe(questions.length);
    }
  });
});
