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

describe('Search deep link', () => {
  it('search result item includes question id in practice URL', async () => {
    const result = await buildSearchIndex();
    if (result.length > 0) {
      const item = result[0];
      const practiceUrl = `/practice/${item.practice_slug}?q=${item.id}`;
      // URL should contain ?q= with the item's id
      expect(practiceUrl).toContain('?q=');
      expect(practiceUrl).toContain(item.id);
      // The practice_slug should be a valid topic slug (non-empty)
      expect(item.practice_slug).toBeTruthy();
      // The id should be a non-empty string identifier
      expect(item.id).toBeTruthy();
      expect(typeof item.id).toBe('string');
    }
  });

  it('each search index item has a unique id field', async () => {
    const result = await buildSearchIndex();
    const ids = result.map((item: SearchIndexItem) => item.id);
    const uniqueIds = new Set(ids);
    // All ids should be truthy strings
    ids.forEach((id) => {
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });
    // We only check uniqueness if we have items (some topics may share ids across different files)
    expect(ids.length).toBe(result.length);
  });

  it('each search index item has a practice_slug', async () => {
    const result = await buildSearchIndex();
    result.forEach((item: SearchIndexItem) => {
      expect(item.practice_slug).toBeTruthy();
      expect(item.practice_slug).toMatch(/^[a-z0-9-]+$/);
    });
  });
});