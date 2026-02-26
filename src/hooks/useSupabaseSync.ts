import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { TimeEvent } from '../types';

/**
 * Sync local events ↔ Supabase.
 * Strategy: on login, merge local + cloud. On changes, push to cloud.
 */
export function useSupabaseSync(
    user: User | null,
    events: TimeEvent[],
    replaceAllEvents: (events: TimeEvent[]) => void,
) {
    const hasSynced = useRef(false);
    const isSyncing = useRef(false);

    // Convert local TimeEvent → Supabase row
    const toRow = useCallback((e: TimeEvent, userId: string) => ({
        id: e.id.includes('-') && e.id.length > 20 ? e.id : undefined, // only pass valid UUIDs
        user_id: userId,
        name: e.name,
        target_date: e.targetDate,
        category: e.category,
        color: e.color,
        created_at: e.createdAt,
        sort_order: e.order,
        recurring: e.recurring || 'none',
        note: e.note || null,
        pinned: e.pinned || false,
        archived: e.archived || false,
        reminder_minutes: e.reminderMinutes || 0,
    }), []);

    // Convert Supabase row → local TimeEvent
    const toEvent = useCallback((row: Record<string, unknown>): TimeEvent => ({
        id: row.id as string,
        name: row.name as string,
        targetDate: row.target_date as string,
        category: row.category as string,
        color: row.color as string,
        createdAt: row.created_at as string,
        order: row.sort_order as number,
        recurring: (row.recurring as 'none' | 'yearly') || 'none',
        note: (row.note as string) || undefined,
        pinned: (row.pinned as boolean) || false,
        archived: (row.archived as boolean) || false,
        reminderMinutes: (row.reminder_minutes as number) || 0,
    }), []);

    // Initial sync: pull cloud data and merge with local
    useEffect(() => {
        if (!user || hasSynced.current) return;

        const syncInit = async () => {
            isSyncing.current = true;
            try {
                // Fetch cloud events
                const { data: cloudRows, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('sort_order', { ascending: true });

                if (error) {
                    console.error('Sync fetch error:', error);
                    return;
                }

                const cloudEvents = (cloudRows || []).map(toEvent);

                if (cloudEvents.length === 0 && events.length > 0) {
                    // First time: push local events to cloud
                    const rows = events.map(e => {
                        const row = toRow(e, user.id);
                        // Remove id if not a valid UUID (local IDs are timestamp-based)
                        if (!row.id) delete row.id;
                        return row;
                    });

                    const { data: inserted, error: insertError } = await supabase
                        .from('events')
                        .insert(rows)
                        .select();

                    if (insertError) {
                        console.error('Initial push error:', insertError);
                    } else if (inserted) {
                        // Replace local events with cloud-assigned UUIDs
                        replaceAllEvents(inserted.map(toEvent));
                    }
                } else if (cloudEvents.length > 0) {
                    // Use cloud data as source of truth
                    replaceAllEvents(cloudEvents);
                }

                hasSynced.current = true;
            } finally {
                isSyncing.current = false;
            }
        };

        syncInit();
    }, [user, events, replaceAllEvents, toEvent, toRow]);

    // Push changes to cloud whenever events change (after initial sync)
    useEffect(() => {
        if (!user || !hasSynced.current || isSyncing.current) return;

        const pushToCloud = async () => {
            isSyncing.current = true;
            try {
                // Upsert all current events
                const rows = events.map(e => ({
                    ...toRow(e, user.id),
                    id: e.id, // cloud events already have UUID ids
                }));

                // Delete events from cloud that are not in local
                const localIds = events.map(e => e.id);
                const { data: cloudRows } = await supabase
                    .from('events')
                    .select('id')
                    .eq('user_id', user.id);

                if (cloudRows) {
                    const cloudIds = cloudRows.map((r: { id: string }) => r.id);
                    const toDelete = cloudIds.filter(id => !localIds.includes(id));
                    if (toDelete.length > 0) {
                        await supabase.from('events').delete().in('id', toDelete);
                    }
                }

                if (rows.length > 0) {
                    await supabase.from('events').upsert(rows, { onConflict: 'id' });
                }
            } finally {
                isSyncing.current = false;
            }
        };

        // Debounce pushes
        const timer = setTimeout(pushToCloud, 1500);
        return () => clearTimeout(timer);
    }, [user, events, toRow]);

    // Reset sync state on logout
    useEffect(() => {
        if (!user) {
            hasSynced.current = false;
        }
    }, [user]);
}
