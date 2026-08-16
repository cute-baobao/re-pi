import type { Metadata } from 'next';

import { RoadmapApp } from '@/components/roadmap-app';
import { dshRoadmapData } from '@/lib/roadmap-schema';
import { useDshProgressStore } from '@/lib/dsh-progress-store';

export const metadata: Metadata = {
  title: 'DeepSeek Harness Rebuild RoadMap',
  description: '从 DeepSeek Harness 源码出发，按核心概念亲手复刻 Agent Harness 的学习路线、资料图谱与本地进度追踪器。',
};

export default function DshRoadmapPage() {
  return <RoadmapApp data={dshRoadmapData} store={useDshProgressStore} />;
}
