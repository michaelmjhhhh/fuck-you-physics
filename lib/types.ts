export type QuestionOption = {
  label: string;
  text: string;
};

export type DiagramMetadata = {
  description: string;
  labels_to_preserve: string[];
};

export type QuestionPaper = {
  year: number;
  month: string;
  session_label: string;
  level: string;
  timezone: string;
  paper_code: string;
  source_filename: string;
};

export type QuestionRecord = {
  id: string;
  topic: string;
  topic_code: string;
  sub_topic: string;
  paper: QuestionPaper;
  question_number: number;
  content_markdown: string;
  has_diagram: boolean;
  diagram_metadata: DiagramMetadata;
  options: QuestionOption[];
  correct_answer: string;
  vibe_explanation: string;
  source_image_path?: string;
};

export type TopicMeta = {
  slug: string;
  topicCode: string;
  sectionLetter: string;
  displayName: string;
  sourceFolder: string;
  datasetPath: string;
  questionCount: number;
  description: string;
};

export type SyllabusSection = {
  letter: string;
  title: string;
  topics: TopicMeta[];
};

export type ReviewManifest = {
  id: string;
  topic: string;
  topic_code: string;
  sub_topic: string;
  paper: {
    year: number | string;
    month: string;
    session_label: string;
    level: string;
    timezone: string;
    paper_code: string;
    source_filename: string;
  };
  question_number: number | string;
  correct_answer: string;
  has_diagram: boolean;
  diagram_metadata: DiagramMetadata;
  source_image_path: string;
  options: QuestionOption[];
  content_markdown: string;
  vibe_explanation: string;
};
