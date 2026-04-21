export type SearchIndexItem = {
  id: string;
  topic: string;
  topic_code: string;
  sub_topic: string;
  question_number: number;
  content_markdown: string;
  correct_answer: string;
  paper_year: number;
  paper_month: string;
  paper_level: string;
  practice_slug: string;
};

export type SearchResult = {
  item: SearchIndexItem;
  score: number;
};