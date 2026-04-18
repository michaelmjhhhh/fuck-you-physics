import { ReviewEditor } from '@/components/review-editor';
import { loadSampleReviewManifest } from '@/lib/review';

export default async function ReviewPage() {
  const sampleManifest = await loadSampleReviewManifest();

  return (
    <ReviewEditor initialManifest={sampleManifest} />
  );
}
