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

    // ↑ 本地 → 云端（增量更新/覆盖）
    const pushToCloud = useCallback(async () => {
        if (!user || syncing) return;
        setSyncing(true);
        try {
            if (events.length === 0) {
                // 如果本地为空，可能真的想清空云端，这里保留删除逻辑但需谨慎
                await supabase.from('events').delete().eq('user_id', user.id);
            } else {
                const rows = events.map((e, i) => ({
                    id: e.id, // 关键：包含 ID 以便 upsert 识别
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

                // 使用 upsert：根据主键（通常是 id）更新，如果不存在则插入
                // 注意：在 Supabase 中需要确保 id 是主键且 RLS 允许更新
                const { error } = await supabase.from('events').upsert(rows, {
                    onConflict: 'id',
                });

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
