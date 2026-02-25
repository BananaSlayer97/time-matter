import { useMemo } from 'react';
import type { TimeEvent } from '../types';
import './StatsBar.css';

interface StatsBarProps {
    events: TimeEvent[];
}

export function StatsBar({ events }: StatsBarProps) {
    const stats = useMemo(() => {
        const now = Date.now();
        const future = events.filter(e => new Date(e.targetDate).getTime() > now);
        const past = events.filter(e => new Date(e.targetDate).getTime() <= now);

        // Nearest upcoming event
        let nearest: TimeEvent | null = null;
        let nearestDays = Infinity;
        for (const e of future) {
            const days = Math.ceil((new Date(e.targetDate).getTime() - now) / 86400000);
            if (days < nearestDays) {
                nearestDays = days;
                nearest = e;
            }
        }

        // Total tracked days (oldest event to now)
        let trackedDays = 0;
        if (events.length > 0) {
            const oldest = events.reduce((a, b) =>
                new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? a : b
            );
            trackedDays = Math.floor((now - new Date(oldest.createdAt).getTime()) / 86400000);
        }

        // Recurring events count
        const recurring = events.filter(e => e.recurring === 'yearly').length;

        return { total: events.length, future: future.length, past: past.length, nearest, nearestDays, trackedDays, recurring };
    }, [events]);

    if (events.length === 0) return null;

    return (
        <div className="stats-bar">
            <div className="stats-card">
                <span className="stats-value">{stats.total}</span>
                <span className="stats-label">总事件</span>
            </div>
            <div className="stats-card">
                <span className="stats-value">{stats.future}</span>
                <span className="stats-label">即将到来</span>
            </div>
            <div className="stats-card">
                <span className="stats-value">{stats.past}</span>
                <span className="stats-label">已过去</span>
            </div>
            {stats.nearest && (
                <div className="stats-card stats-card--highlight">
                    <span className="stats-value">{stats.nearestDays}天</span>
                    <span className="stats-label" title={stats.nearest.name}>
                        {stats.nearest.name.length > 8
                            ? stats.nearest.name.slice(0, 8) + '…'
                            : stats.nearest.name
                        }
                    </span>
                </div>
            )}
            <div className="stats-card">
                <span className="stats-value">{stats.trackedDays}</span>
                <span className="stats-label">追踪天数</span>
            </div>
            {stats.recurring > 0 && (
                <div className="stats-card">
                    <span className="stats-value">🔁 {stats.recurring}</span>
                    <span className="stats-label">周期事件</span>
                </div>
            )}
        </div>
    );
}
