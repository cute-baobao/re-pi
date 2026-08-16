import type { Metadata } from 'next';

import { RoadmapApp } from '@/components/roadmap-app';
import { roadmapData } from '@/lib/roadmap-schema';
import { useProgressStore } from '@/lib/progress-store';

export const metadata: Metadata = {
  title: 'Pi Agent 核心概念 | Rebuild RoadMap',
  description: '理解 Agent、Pi Harness、上下文、工具、记忆与事件循环的核心概念和学习资料。',
};

export default function ConceptsPage() {
  return <RoadmapApp data={roadmapData} store={useProgressStore} mode="concepts" />;
}
