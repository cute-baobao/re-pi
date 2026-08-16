import type { Metadata } from 'next';

import { RoadmapApp } from '@/components/roadmap-app';
import { roadmapData } from '@/lib/roadmap-schema';
import { useProgressStore } from '@/lib/progress-store';

export const metadata: Metadata = {
  title: 'Pi Agent 实现路线 | Rebuild RoadMap',
  description: '使用 TypeScript、Zod 和 Node.js 分阶段复刻 Pi Agent 的实现路线与本地进度追踪。',
};

export default function ImplementationPage() {
  return <RoadmapApp data={roadmapData} store={useProgressStore} mode="implementation" />;
}
