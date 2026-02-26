import { useState, useMemo } from 'react';
import type { TimeEvent, CategoryInfo } from '../types';
import { CATEGORIES } from '../types';
import './StatsBar.css';

const allCategories: Record<string, CategoryInfo> = CATEGORIES;

interface StatsBarProps {
    events: TimeEvent[];
}

export function StatsBar({ events }: StatsBarProps) {
    const [expanded, setExpanded] = useState(false);

    const stats = useMemo(() => {
        const now = Date.now();
        const future = events.filter(e => new Date(e.targetDate).getTime() > now);
        const past = events.filter(e => new Date(e.targetDate).getTime() <= now);
        const recurring = events.filter(e => e.recurring === 'yearly').length;

        let nearest: TimeEvent | null = null;
        let nearestDays = Infinity;
        for (const e of future) {
            const days = Math.ceil((new Date(e.targetDate).getTime() - now) / 86400000);
            if (days < nearestDays) {
                nearestDays = days;
                nearest = e;
            }
        }

        // Week & month upcoming
        const weekLater = now + 7 * 86400000;
        const monthLater = now + 30 * 86400000;
        const thisWeek = future.filter(e => new Date(e.targetDate).getTime() <= weekLater).length;
        const thisMonth = future.filter(e => new Date(e.targetDate).getTime() <= monthLater).length;

        // Category breakdown (top 4)
        const categoryMap: Record<string, number> = {};
        for (const e of events) {
            categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
        }
        const topCategories = Object.entries(categoryMap)
            .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
            .slice(0, 4)
            .map(([cat, count]) => ({
                category: cat,
                count: count ?? 0,
                info: allCategories[cat] || { label: cat, icon: '🏷️', gradient: 'linear-gradient(135deg, #ccc 0%, #999 100%)' },
            }));

        // Tracked days
        let trackedDays = 0;
        if (events.length > 0) {
            const oldest = events.reduce((a, b) =>
                new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? a : b
            );
            trackedDays = Math.floor((now - new Date(oldest.createdAt).getTime()) / 86400000);
        }

        return { total: events.length, future: future.length, past: past.length, recurring, nearest, nearestDays, thisWeek, thisMonth, topCategories, trackedDays };
    }, [events]);

    if (events.length === 0) return null;

    return (
        <div className="stats-strip-wrap">
            <div className="stats-strip" onClick={() => setExpanded(!expanded)}>
                <div className="stats-strip__item">
                    <span className="stats-strip__value">{stats.total}</span>
                    <span className="stats-strip__label">全部</span>
                </div>
                <div className="stats-strip__sep" />
                <div className="stats-strip__item">
                    <span className="stats-strip__value stats-strip__value--gold">{stats.future}</span>
                    <span className="stats-strip__label">倒计时</span>
                </div>
                <div className="stats-strip__sep" />
                <div className="stats-strip__item">
                    <span className="stats-strip__value stats-strip__value--ice">{stats.past}</span>
                    <span className="stats-strip__label">已过去</span>
                </div>
                {stats.recurring > 0 && (
                    <>
                        <div className="stats-strip__sep" />
                        <div className="stats-strip__item">
                            <span className="stats-strip__value">{stats.recurring}</span>
                            <span className="stats-strip__label">循环</span>
                        </div>
                    </>
                )}
                {stats.nearest && (
                    <>
                        <div className="stats-strip__sep" />
                        <div className="stats-strip__item stats-strip__item--next">
                            <span className="stats-strip__next-badge">
                                {CATEGORIES[stats.nearest.category]?.icon ?? '🏷️'}
                            </span>
                            <div className="stats-strip__next-info">
                                <span className="stats-strip__next-name">{stats.nearest.name}</span>
                                <span className="stats-strip__next-days">{stats.nearestDays}天后</span>
                            </div>
                        </div>
                    </>
                )}
                <div className="stats-strip__expand">
                    <svg className={`stats-strip__chevron ${expanded ? 'expanded' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>

            {/* Expandable detail panel */}
            <div className={`stats-detail ${expanded ? 'stats-detail--open' : ''}`}>
                <div className="stats-detail__inner">
                    <div className="stats-detail__row">
                        <div className="stats-detail__cell">
                            <span className="stats-detail__cell-label">本周到来</span>
                            <span className="stats-detail__cell-value">{stats.thisWeek}</span>
                        </div>
                        <div className="stats-detail__cell">
                            <span className="stats-detail__cell-label">本月到来</span>
                            <span className="stats-detail__cell-value">{stats.thisMonth}</span>
                        </div>
                        <div className="stats-detail__cell">
                            <span className="stats-detail__cell-label">追踪天数</span>
                            <span className="stats-detail__cell-value">{stats.trackedDays}</span>
                        </div>
                    </div>
                    {stats.topCategories.length > 0 && (
                        <div className="stats-detail__cats">
                            {stats.topCategories.map(({ category, count, info }) => (
                                <div key={category} className="stats-detail__cat">
                                    <span className="stats-detail__cat-icon">{info.icon}</span>
                                    <span className="stats-detail__cat-name">{info.label}</span>
                                    <div className="stats-detail__cat-bar">
                                        <div className="stats-detail__cat-fill" style={{ width: `${(count / stats.total) * 100}%`, background: info.gradient }} />
                                    </div>
                                    <span className="stats-detail__cat-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
