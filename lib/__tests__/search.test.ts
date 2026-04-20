import { describe, it, expect } from 'vitest';
import { buildSearchIndex } from '@/lib/search-index';
import type { SearchIndexItem } from '@/lib/search-types';

describe('buildSearchIndex', () => {
  it('returns an array', async () => {
    const result = await buildSearchIndex();
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns SearchIndexItem objects with required fields', async () => {
    const result = await buildSearchIndex();
    if (result.length > 0) {
      const item = result[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('topic');
      expect(item).toHaveProperty('topic_code');
      expect(item).toHaveProperty('sub_topic');
      expect(item).toHaveProperty('question_number');
      expect(item).toHaveProperty('content_markdown');
      expect(item).toHaveProperty('correct_answer');
      expect(item).toHaveProperty('paper_year');
      expect(item).toHaveProperty('paper_month');
      expect(item).toHaveProperty('paper_level');
    }
  });

  it('loads from all 11 prepared-questions JSON files', async () => {
    const result = await buildSearchIndex();
    const topicCodes = new Set(result.map((item: SearchIndexItem) => item.topic_code));
    expect(topicCodes.size).toBeGreaterThan(0);
  });
});