'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { ProgressStateSchema, type ProgressState } from '@/lib/roadmap-schema';

type PersistedProgress = ProgressState;

interface ProgressActions {
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  toggleTask: (key: string, complete: boolean) => void;
  toggleConcept: (id: string, complete: boolean) => void;
  setNotes: (phaseId: string, notes: string) => void;
  setActualHours: (phaseId: string, hours: string) => void;
  replaceProgress: (progress: ProgressState) => void;
  resetProgress: () => void;
}

export type ProgressStore = ReturnType<typeof createProgressStore>;

const initialProgress: PersistedProgress = {
  version: 1,
  completed: {},
  conceptCompleted: {},
  notes: {},
  actualHours: {},
  updatedAt: null,
};

const timestamp = () => new Date().toISOString();

const legacyCompatibleStorage: StateStorage = {
  getItem(name) {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && 'state' in parsed) return raw;
      const legacy = ProgressStateSchema.safeParse(parsed);
      if (!legacy.success) return null;
      return JSON.stringify({ state: legacy.data, version: 1 });
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    if (typeof window === 'undefined') return;
    const wrapped = JSON.parse(value) as { state?: unknown };
    const parsed = ProgressStateSchema.safeParse(wrapped.state);
    if (parsed.success) window.localStorage.setItem(name, JSON.stringify(parsed.data));
  },
  removeItem(name) {
    if (typeof window !== 'undefined') window.localStorage.removeItem(name);
  },
};

export const createProgressStore = (storageKey: string) => create<PersistedProgress & ProgressActions>()(
  persist(
    (set) => ({
      ...initialProgress,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      toggleTask: (key, complete) => set((state) => {
        const completed = { ...state.completed };
        if (complete) completed[key] = true;
        else delete completed[key];
        return { completed, updatedAt: timestamp() };
      }),
      toggleConcept: (id, complete) => set((state) => {
        const conceptCompleted = { ...state.conceptCompleted };
        if (complete) conceptCompleted[id] = true;
        else delete conceptCompleted[id];
        return { conceptCompleted, updatedAt: timestamp() };
      }),
      setNotes: (phaseId, notes) => set((state) => ({
        notes: { ...state.notes, [phaseId]: notes },
        updatedAt: timestamp(),
      })),
      setActualHours: (phaseId, hours) => set((state) => ({
        actualHours: { ...state.actualHours, [phaseId]: hours },
        updatedAt: timestamp(),
      })),
      replaceProgress: (progress) => set({ ...progress, hydrated: true }),
      resetProgress: () => set({ ...initialProgress, hydrated: true }),
    }),
    {
      name: storageKey,
      version: 1,
      storage: createJSONStorage(() => legacyCompatibleStorage),
      skipHydration: true,
      partialize: (state) => ({
        version: state.version,
        completed: state.completed,
        conceptCompleted: state.conceptCompleted,
        notes: state.notes,
        actualHours: state.actualHours,
        updatedAt: state.updatedAt,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

/** Pi Agent Rebuild RoadMap 的本地进度(沿用旧 key,保证已有进度自动读取)。 */
export const useProgressStore = createProgressStore('pi-agent-roadmap-progress-v1');
