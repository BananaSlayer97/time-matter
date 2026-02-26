import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { TimeEvent } from '../types';

const LAST_SYNC_KEY = 'time-matter-last-sync';

/**
 * 手动同步 — 简单明了：
 * ↑ pushToCloud: 本地覆盖云端
 * ↓ pullFromCloud: 云端覆盖本地
 */
export function useCloudSync(
    user: User | null,
    events: TimeEvent[],
    replaceAllEvents: (events: TimeEvent[]) => void,
) {
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(
        () => localStorage.getItem(LAST_SYNC_KEY)
    );

    // ↑ 本地 → 云端（覆盖）
    const pushToCloud = useCallback(async () => {
        if (!user || syncing) return;
        setSyncing(true);
        try {
            // 1. 清空云端该用户的所有数据
            await supabase.from('events').delete().eq('user_id', user.id);

            // 2. 把本地数据全量写入
            if (events.length > 0) {
                const rows = events.map((e, i) => ({
                    user_id: user.id,
                    name: e.name,
                    target_date: e.targetDate,
                    category: e.category,
                    color: e.color,
                    created_at: e.createdAt,
                    sort_order: i,
                    recurring: e.recurring || 'none',
                    note: e.note || null,
                    pinned: e.pinned || false,
                    archived: e.archived || false,
                    reminder_minutes: e.reminderMinutes || 0,
                }));

                const { error } = await supabase.from('events').insert(rows);
                if (error) throw error;
            }

            const now = new Date().toISOString();
            localStorage.setItem(LAST_SYNC_KEY, now);
            setLastSync(now);
            return true;
        } catch (err) {
            console.error('[Sync] Push error:', err);
            return false;
        } finally {
            setSyncing(false);
        }
    }, [user, events, syncing]);

    // ↓ 云端 → 本地（覆盖）
    const pullFromCloud = useCallback(async () => {
        if (!user || syncing) return;
        setSyncing(true);
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', user.id)
                .order('sort_order', { ascending: true });

            if (error) throw error;

            const cloudEvents: TimeEvent[] = (data || []).map((row: Record<string, unknown>) => ({
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
            }));

            replaceAllEvents(cloudEvents);

            const now = new Date().toISOString();
            localStorage.setItem(LAST_SYNC_KEY, now);
            setLastSync(now);
            return true;
        } catch (err) {
            console.error('[Sync] Pull error:', err);
            return false;
        } finally {
            setSyncing(false);
        }
    }, [user, replaceAllEvents, syncing]);

    return { syncing, lastSync, pushToCloud, pullFromCloud };
}
