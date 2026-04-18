import { notFound } from 'next/navigation';
import { PracticeClient } from '@/components/practice-client';
import { loadQuestionSet } from '@/lib/questions';
import { getTopicBySlug, getTopics } from '@/lib/topics';

export async function generateStaticParams() {
  const topics = await getTopics();
  return topics.map((topic) => ({ topic: topic.slug }));
}

export default async function PracticePage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicSlug } = await params;
  const topic = await getTopicBySlug(topicSlug);
  const topics = await getTopics();

  if (!topic) {
    notFound();
  }

  const questions = await loadQuestionSet(`${topic.slug}.json`);

  if (!questions.length) {
    notFound();
  }

  return <PracticeClient topic={topic} questions={questions} topics={topics} />;
}
