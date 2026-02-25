import { useState, useCallback, useEffect } from 'react';
import type { TimeEvent, CategoryInfo } from '../types';

const STORAGE_KEY = 'time-matter-events';
const CUSTOM_CATEGORIES_KEY = 'time-matter-custom-categories';

function loadEvents(): TimeEvent[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as TimeEvent[];
    } catch {
        return [];
    }
}

function saveEvents(events: TimeEvent[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Custom categories management
function loadCustomCategories(): Record<string, CategoryInfo> {
    try {
        const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
        if (!raw) return {};
        return JSON.parse(raw) as Record<string, CategoryInfo>;
    } catch {
        return {};
    }
}

function saveCustomCategories(cats: Record<string, CategoryInfo>): void {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(cats));
}

export function useEvents() {
    const [events, setEvents] = useState<TimeEvent[]>(loadEvents);
    const [customCategories, setCustomCategories] = useState<Record<string, CategoryInfo>>(loadCustomCategories);

    useEffect(() => {
        saveEvents(events);
    }, [events]);

    useEffect(() => {
        saveCustomCategories(customCategories);
    }, [customCategories]);

    const addEvent = useCallback((event: Omit<TimeEvent, 'id' | 'createdAt' | 'order'>) => {
        setEvents(prev => {
            const newEvent: TimeEvent = {
                ...event,
                id: generateId(),
                createdAt: new Date().toISOString(),
                order: prev.length,
            };
            return [...prev, newEvent];
        });
    }, []);

    const updateEvent = useCallback((id: string, updates: Partial<Omit<TimeEvent, 'id' | 'createdAt'>>) => {
        setEvents(prev =>
            prev.map(e => (e.id === id ? { ...e, ...updates } : e))
        );
    }, []);

    const deleteEvent = useCallback((id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
    }, []);

    const reorderEvents = useCallback((fromIndex: number, toIndex: number) => {
        setEvents(prev => {
            const copy = [...prev];
            const [moved] = copy.splice(fromIndex, 1);
            copy.splice(toIndex, 0, moved);
            return copy.map((e, i) => ({ ...e, order: i }));
        });
    }, []);

    const replaceAllEvents = useCallback((newEvents: TimeEvent[]) => {
        setEvents(newEvents.map((e, i) => ({ ...e, order: i })));
    }, []);

    // ---- New features ----

    const duplicateEvent = useCallback((id: string) => {
        setEvents(prev => {
            const source = prev.find(e => e.id === id);
            if (!source) return prev;
            const clone: TimeEvent = {
                ...source,
                id: generateId(),
                name: `${source.name} (副本)`,
                createdAt: new Date().toISOString(),
                order: prev.length,
                pinned: false,
                archived: false,
            };
            return [...prev, clone];
        });
    }, []);

    const togglePin = useCallback((id: string) => {
        setEvents(prev =>
            prev.map(e => (e.id === id ? { ...e, pinned: !e.pinned } : e))
        );
    }, []);

    const toggleArchive = useCallback((id: string) => {
        setEvents(prev =>
            prev.map(e => (e.id === id ? { ...e, archived: !e.archived } : e))
        );
    }, []);

    // Custom category management
    const addCustomCategory = useCallback((key: string, info: CategoryInfo) => {
        setCustomCategories(prev => ({ ...prev, [key]: info }));
    }, []);

    const removeCustomCategory = useCallback((key: string) => {
        setCustomCategories(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    // Sort: pinned first, then by order
    const sortedEvents = events
        .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return a.order - b.order;
        });

    return {
        events: sortedEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        reorderEvents,
        replaceAllEvents,
        duplicateEvent,
        togglePin,
        toggleArchive,
        customCategories,
        addCustomCategory,
        removeCustomCategory,
    };
}
