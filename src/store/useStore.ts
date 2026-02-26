import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TimeEvent, CategoryInfo } from '../types';

interface AppState {
    events: TimeEvent[];
    customCategories: Record<string, CategoryInfo>;

    // Actions
    addEvent: (event: Omit<TimeEvent, 'id' | 'createdAt' | 'order'>) => void;
    updateEvent: (id: string, updates: Partial<Omit<TimeEvent, 'id' | 'createdAt'>>) => void;
    deleteEvent: (id: string) => void;
    replaceAllEvents: (newEvents: TimeEvent[]) => void;
    togglePin: (id: string) => void;
    toggleArchive: (id: string) => void;
    duplicateEvent: (id: string) => void;

    // Category Actions
    addCustomCategory: (key: string, info: CategoryInfo) => void;
    removeCustomCategory: (key: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            events: [],
            customCategories: {},

            addEvent: (eventData) => {
                const newEvent: TimeEvent = {
                    ...eventData,
                    id: crypto.randomUUID(), // [P1] Optimization
                    createdAt: new Date().toISOString(),
                    order: get().events.length,
                };
                set((state) => ({ events: [...state.events, newEvent] }));
            },

            updateEvent: (id, updates) => {
                set((state) => ({
                    events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
                }));
            },

            deleteEvent: (id) => {
                set((state) => ({
                    events: state.events.filter((e) => e.id !== id),
                }));
            },

            replaceAllEvents: (newEvents) => {
                set({ events: newEvents.map((e, i) => ({ ...e, order: i })) });
            },

            togglePin: (id) => {
                set((state) => ({
                    events: state.events.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e)),
                }));
            },

            toggleArchive: (id) => {
                set((state) => ({
                    events: state.events.map((e) => (e.id === id ? { ...e, archived: !e.archived } : e)),
                }));
            },

            duplicateEvent: (id) => {
                const source = get().events.find((e) => e.id === id);
                if (!source) return;
                const clone: TimeEvent = {
                    ...source,
                    id: crypto.randomUUID(), // [P1] Optimization
                    name: `${source.name} (副本)`,
                    createdAt: new Date().toISOString(),
                    order: get().events.length,
                    pinned: false,
                    archived: false,
                };
                set((state) => ({ events: [...state.events, clone] }));
            },

            addCustomCategory: (key, info) => {
                set((state) => ({
                    customCategories: { ...state.customCategories, [key]: info },
                }));
            },

            removeCustomCategory: (key) => {
                set((state) => {
                    const next = { ...state.customCategories };
                    delete next[key];
                    return { customCategories: next };
                });
            },
        }),
        {
            name: 'time-matter-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
