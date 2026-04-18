import path from 'node:path';
import { cache } from 'react';
import { getTopicDescription, listPreparedQuestionFiles, loadQuestionSet } from '@/lib/questions';
import type { SyllabusSection, TopicMeta } from '@/lib/types';

const sectionTitles: Record<string, string> = {
  A: 'Space, time and motion',
  B: 'The particulate nature of matter',
  C: 'Wave behaviour',
  D: 'Fields',
  E: 'Nuclear and quantum physics',
};

const displayOrder = ['A', 'B', 'C', 'D', 'E'];

export const getTopics = cache(async (): Promise<TopicMeta[]> => {
  const files = await listPreparedQuestionFiles();
  const topics = await Promise.all(
    files.map(async (fileName) => {
      const questions = await loadQuestionSet(fileName);
      if (!questions.length) return null;

      const first = questions[0];
      const slug = fileName.replace(/\.json$/i, '');
      const sectionLetter = first.topic_code.charAt(0).toUpperCase();
      const sourceFolder = first.source_image_path ? first.source_image_path.split('/')[0] : slug;

      return {
        slug,
        topicCode: first.topic_code,
        sectionLetter,
        displayName: first.topic,
        sourceFolder,
        datasetPath: path.join('prepared-questions', fileName),
        questionCount: questions.length,
        description: getTopicDescription(first.topic_code, first.topic),
      } satisfies TopicMeta;
    }),
  );

  return topics.filter((topic): topic is TopicMeta => Boolean(topic)).sort((a, b) => a.topicCode.localeCompare(b.topicCode));
});

export const getTopicBySlug = cache(async (slug: string) => {
  const topics = await getTopics();
  return topics.find((topic) => topic.slug === slug) ?? null;
});

export const getSyllabusSections = cache(async (): Promise<SyllabusSection[]> => {
  const topics = await getTopics();

  return displayOrder.map((letter) => ({
    letter,
    title: sectionTitles[letter] ?? `Section ${letter}`,
    topics: topics.filter((topic) => topic.sectionLetter === letter),
  }));
});
