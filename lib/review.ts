import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ReviewManifest } from '@/lib/types';

export async function loadSampleReviewManifest(): Promise<ReviewManifest> {
  const filePath = path.join(process.cwd(), 'review-manifest.json');
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as ReviewManifest;
}
