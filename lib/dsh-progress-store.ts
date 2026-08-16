'use client';

import { createProgressStore, type ProgressStore } from '@/lib/progress-store';

/** DeepSeek Harness Rebuild RoadMap 的本地进度(独立 key,与 Pi 版互不干扰)。 */
export const useDshProgressStore = createProgressStore('dsh-agent-roadmap-progress-v1');

export type { ProgressStore };
