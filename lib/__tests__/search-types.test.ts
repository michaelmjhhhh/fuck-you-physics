import { describe, it, expect } from 'vitest';
import type { SearchIndexItem, SearchResult } from '@/lib/search-types';

describe('SearchIndexItem type', () => {
  it('should have required fields', () => {
    const item: SearchIndexItem = {
      id: 'test-id',
      topic: 'Test Topic',
      topic_code: 'A4',
      sub_topic: 'Test Sub Topic',
      question_number: 1,
      content_markdown: 'Test question content',
      correct_answer: 'A',
      paper_year: 2000,
      paper_month: 'May',
      paper_level: 'HL',
    };
    expect(item.id).toBe('test-id');
    expect(item.topic_code).toBe('A4');
  });
});

describe('SearchResult type', () => {
  it('should have required fields', () => {
    const result: SearchResult = {
      item: {
        id: 'test-id',
        topic: 'Test Topic',
        topic_code: 'A4',
        sub_topic: 'Test Sub Topic',
        question_number: 1,
        content_markdown: 'Test question content',
        correct_answer: 'A',
        paper_year: 2000,
        paper_month: 'May',
        paper_level: 'HL',
      },
      score: 0.5,
    };
    expect(result.score).toBe(0.5);
    expect(result.item.id).toBe('test-id');
  });
});