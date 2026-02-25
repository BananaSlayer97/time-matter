import { useState, useCallback, useEffect } from 'react';
import type { TimeEvent } from '../types';

const STORAGE_KEY = 'time-matter-events';

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

export function useEvents() {
    const [events, setEvents] = useState<TimeEvent[]>(loadEvents);

    useEffect(() => {
        saveEvents(events);
    }, [events]);

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

    return {
        events: events.sort((a, b) => a.order - b.order),
        addEvent,
        updateEvent,
        deleteEvent,
        reorderEvents,
    };
}
