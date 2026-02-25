import { useMemo } from 'react';
import type { TimeEvent, CategoryInfo } from '../types';
import { CATEGORIES } from '../types';
import './StatsBar.css';

// Allow string-key indexing for custom categories
const allCategories: Record<string, CategoryInfo> = CATEGORIES;

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

        // Most recent past event
        let latestPast: TimeEvent | null = null;
        let latestPastDays = Infinity;
        for (const e of past) {
            const days = Math.floor((now - new Date(e.targetDate).getTime()) / 86400000);
            if (days < latestPastDays) {
                latestPastDays = days;
                latestPast = e;
            }
        }

        // Total tracked days (oldest event creation to now)
        let trackedDays = 0;
        if (events.length > 0) {
            const oldest = events.reduce((a, b) =>
                new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? a : b
            );
            trackedDays = Math.floor((now - new Date(oldest.createdAt).getTime()) / 86400000);
        }

        // Category breakdown
        const categoryMap: Record<string, number> = {};
        for (const e of events) {
            categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
        }
        // Sort by count desc, take top 3
        const topCategories = Object.entries(categoryMap)
            .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
            .slice(0, 3)
            .map(([cat, count]) => ({
                category: cat as string,
                count: count ?? 0,
                info: allCategories[cat as string] || { label: cat, icon: '🏷️', gradient: 'linear-gradient(135deg, #ccc 0%, #999 100%)' },
            }));

        // This week & this month upcoming
        const weekLater = now + 7 * 86400000;
        const monthLater = now + 30 * 86400000;
        const thisWeek = future.filter(e => new Date(e.targetDate).getTime() <= weekLater).length;
        const thisMonth = future.filter(e => new Date(e.targetDate).getTime() <= monthLater).length;

        // Recurring
        const recurring = events.filter(e => e.recurring === 'yearly').length;

        // Average gap between events (for density)
        let avgGapDays = 0;
        if (events.length > 1) {
            const sorted = [...events]
                .map(e => new Date(e.targetDate).getTime())
                .sort((a, b) => a - b);
            let totalGap = 0;
            for (let i = 1; i < sorted.length; i++) {
                totalGap += sorted[i] - sorted[i - 1];
            }
            avgGapDays = Math.round(totalGap / (sorted.length - 1) / 86400000);
        }

        return {
            total: events.length,
            future: future.length,
            past: past.length,
            nearest,
            nearestDays,
            latestPast,
            latestPastDays,
            trackedDays,
            topCategories,
            thisWeek,
            thisMonth,
            recurring,
            avgGapDays,
        };
    }, [events]);

    if (events.length === 0) return null;

    // Format "X天前" or date
    const formatPastDays = (days: number) => {
        if (days === 0) return '今天';
        if (days === 1) return '昨天';
        if (days < 30) return `${days} 天前`;
        if (days < 365) return `${Math.floor(days / 30)} 个月前`;
        return `${Math.floor(days / 365)} 年前`;
    };

    const formatFutureDays = (days: number) => {
        if (days === 0) return '今天';
        if (days === 1) return '明天';
        if (days < 7) return `${days} 天后`;
        if (days < 30) return `${Math.floor(days / 7)} 周后`;
        if (days < 365) return `${Math.floor(days / 30)} 个月后`;
        return `${(days / 365).toFixed(1)} 年后`;
    };

    return (
        <div className="stats-dashboard">
            {/* Row 1: Overview cards */}
            <div className="stats-row">
                <div className="stats-card stats-card--wide">
                    <div className="stats-card__header">
                        <span className="stats-card__icon">📊</span>
                        <span className="stats-card__title">事件总览</span>
                    </div>
                    <div className="stats-card__body">
                        <div className="stats-metric">
                            <span className="stats-metric__value">{stats.total}</span>
                            <span className="stats-metric__label">总事件</span>
                        </div>
                        <div className="stats-metric__divider" />
                        <div className="stats-metric">
                            <span className="stats-metric__value stats-metric__value--gold">{stats.future}</span>
                            <span className="stats-metric__label">即将到来</span>
                        </div>
                        <div className="stats-metric__divider" />
                        <div className="stats-metric">
                            <span className="stats-metric__value stats-metric__value--ice">{stats.past}</span>
                            <span className="stats-metric__label">已过去</span>
                        </div>
                    </div>
                    {/* Mini progress bar: future vs past ratio */}
                    {stats.total > 0 && (
                        <div className="stats-progress">
                            <div
                                className="stats-progress__fill"
                                style={{ width: `${(stats.future / stats.total) * 100}%` }}
                            />
                        </div>
                    )}
                </div>

                {stats.nearest && (
                    <div className="stats-card stats-card--highlight stats-card--wide">
                        <div className="stats-card__header">
                            <span className="stats-card__icon">⏳</span>
                            <span className="stats-card__title">最近倒计时</span>
                        </div>
                        <div className="stats-card__body stats-card__body--col">
                            <span className="stats-hero-value">{stats.nearestDays}<small>天</small></span>
                            <span className="stats-hero-label">{stats.nearest.name}</span>
                            <span className="stats-hero-sub">
                                {CATEGORIES[stats.nearest.category as keyof typeof CATEGORIES]?.icon ?? '🏷️'} {CATEGORIES[stats.nearest.category as keyof typeof CATEGORIES]?.label ?? stats.nearest.category}
                                {' · '}{formatFutureDays(stats.nearestDays)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Row 2: Detail cards */}
            <div className="stats-row">
                {/* Time insights */}
                <div className="stats-card">
                    <div className="stats-card__header">
                        <span className="stats-card__icon">📅</span>
                        <span className="stats-card__title">时间洞察</span>
                    </div>
                    <div className="stats-detail-list">
                        <div className="stats-detail-item">
                            <span className="stats-detail-label">本周到来</span>
                            <span className="stats-detail-value">{stats.thisWeek} 个</span>
                        </div>
                        <div className="stats-detail-item">
                            <span className="stats-detail-label">本月到来</span>
                            <span className="stats-detail-value">{stats.thisMonth} 个</span>
                        </div>
                        <div className="stats-detail-item">
                            <span className="stats-detail-label">追踪天数</span>
                            <span className="stats-detail-value">{stats.trackedDays} 天</span>
                        </div>
                        {stats.avgGapDays > 0 && (
                            <div className="stats-detail-item">
                                <span className="stats-detail-label">平均间隔</span>
                                <span className="stats-detail-value">{stats.avgGapDays} 天</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category breakdown */}
                {stats.topCategories.length > 0 && (
                    <div className="stats-card">
                        <div className="stats-card__header">
                            <span className="stats-card__icon">🏷️</span>
                            <span className="stats-card__title">分类分布</span>
                        </div>
                        <div className="stats-cat-list">
                            {stats.topCategories.map(({ category, count, info }) => (
                                <div key={category} className="stats-cat-item">
                                    <span className="stats-cat-icon">{info.icon}</span>
                                    <span className="stats-cat-name">{info.label}</span>
                                    <div className="stats-cat-bar">
                                        <div
                                            className="stats-cat-bar__fill"
                                            style={{
                                                width: `${(count / stats.total) * 100}%`,
                                                background: info.gradient,
                                            }}
                                        />
                                    </div>
                                    <span className="stats-cat-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick info card */}
                <div className="stats-card">
                    <div className="stats-card__header">
                        <span className="stats-card__icon">💡</span>
                        <span className="stats-card__title">快速信息</span>
                    </div>
                    <div className="stats-detail-list">
                        {stats.recurring > 0 && (
                            <div className="stats-detail-item">
                                <span className="stats-detail-label">🔁 周期事件</span>
                                <span className="stats-detail-value">{stats.recurring} 个</span>
                            </div>
                        )}
                        {stats.latestPast && (
                            <div className="stats-detail-item">
                                <span className="stats-detail-label">最近已过</span>
                                <span className="stats-detail-value" title={stats.latestPast.name}>
                                    {formatPastDays(stats.latestPastDays)}
                                </span>
                            </div>
                        )}
                        {events.filter(e => e.note).length > 0 && (
                            <div className="stats-detail-item">
                                <span className="stats-detail-label">📝 有备注</span>
                                <span className="stats-detail-value">
                                    {events.filter(e => e.note).length} 个
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
