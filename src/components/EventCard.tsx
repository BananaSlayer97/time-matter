import { useMemo } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { CATEGORIES } from '../types';
import type { TimeEvent } from '../types';
import { TimeDigit } from './TimeDigit';
import './EventCard.css';

interface EventCardProps {
    event: TimeEvent;
    onEdit: (event: TimeEvent) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onPin: (id: string) => void;
    onArchive: (id: string) => void;
    onExportCal: (event: TimeEvent) => void;
    onClick: (event: TimeEvent) => void;
    index: number;
}

/** Natural language time description */
function describeTime(days: number, isPast: boolean): string {
    const abs = Math.abs(days);
    if (abs === 0) return '就是今天';
    if (abs === 1) return isPast ? '昨天' : '明天';
    if (abs < 7) return isPast ? `${abs} 天前` : `${abs} 天后`;
    if (abs < 30) {
        const weeks = Math.floor(abs / 7);
        return isPast ? `${weeks} 周前` : `${weeks} 周后`;
    }
    if (abs < 365) {
        const months = Math.floor(abs / 30);
        return isPast ? `${months} 个月前` : `${months} 个月后`;
    }
    const years = (abs / 365).toFixed(1);
    return isPast ? `${years} 年前` : `${years} 年后`;
}

/** Calculate yearly progress for recurring events */
function getYearlyProgress(targetDate: string): number {
    const now = new Date();
    const target = new Date(targetDate);
    // Get this year's occurrence
    const thisYear = new Date(now.getFullYear(), target.getMonth(), target.getDate());
    const lastYear = new Date(now.getFullYear() - 1, target.getMonth(), target.getDate());
    const nextYear = new Date(now.getFullYear() + 1, target.getMonth(), target.getDate());

    let start: Date, end: Date;
    if (now >= thisYear) {
        start = thisYear;
        end = nextYear;
    } else {
        start = lastYear;
        end = thisYear;
    }

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function EventCard({ event, onEdit, onDelete, onDuplicate, onPin, onArchive, onExportCal, onClick, index }: EventCardProps) {
    const diff = useCountdown(event.targetDate);
    const category = useMemo(() => (CATEGORIES as Record<string, any>)[event.category] || CATEGORIES.custom, [event.category]);

    const { formattedDate, formattedTime } = useMemo(() => {
        const targetDateObj = new Date(event.targetDate);
        return {
            formattedDate: targetDateObj.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            formattedTime: targetDateObj.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
            })
        };
    }, [event.targetDate]);

    // Natural language description
    // This technically changes once a day, but since diff.days updates, 
    // it's safest to keep it simple or memoize on diff.days
    const naturalTime = useMemo(() => describeTime(diff.days, diff.isPast), [diff.days, diff.isPast]);

    // Creation date info - changes once a day
    const createdStr = useMemo(() => {
        const createdDate = new Date(event.createdAt);
        const createdAgo = Math.floor((Date.now() - createdDate.getTime()) / 86400000);
        return createdAgo === 0 ? '今天创建' : createdAgo < 30
            ? `${createdAgo} 天前创建`
            : `${Math.floor(createdAgo / 30)} 个月前创建`;
    }, [event.createdAt]);

    // Yearly progress - changes very slowly
    const yearlyProgress = useMemo(() =>
        event.recurring === 'yearly' ? getYearlyProgress(event.targetDate) : null,
        [event.recurring, event.targetDate]);

    // Total day span
    const totalSpanDays = useMemo(() => {
        const targetDateObj = new Date(event.targetDate);
        const createdDate = new Date(event.createdAt);
        return Math.abs(Math.floor(
            (targetDateObj.getTime() - createdDate.getTime()) / 86400000
        ));
    }, [event.targetDate, event.createdAt]);

    return (
        <div
            className={`event-card ${diff.isPast ? 'event-card--past' : 'event-card--future'} ${event.pinned ? 'event-card--pinned' : ''} ${event.archived ? 'event-card--archived' : ''}`}
            style={{
                animationDelay: `${index * 0.08}s`,
                '--card-accent': event.color,
            } as React.CSSProperties}
            onClick={() => onClick(event)}
        >
            {/* Glow accent line */}
            <div className="event-card__accent" style={{ background: category.gradient }} />

            <div className="event-card__header">
                <div className="event-card__meta">
                    <span className="event-card__icon">{category.icon}</span>
                    <span className="event-card__category">{category.label}</span>
                    {event.recurring === 'yearly' && (
                        <span className="event-card__recurring">🔁</span>
                    )}
                </div>
                <div className="event-card__actions">
                    <button
                        className={`event-card__btn ${event.pinned ? 'event-card__btn--active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onPin(event.id); }}
                        title={event.pinned ? '取消置顶' : '置顶'}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={event.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10V8l-2.26-2.26a1 1 0 0 0-.71-.29h-3.46l-4-4-1.42 1.42 4 4v3.46a1 1 0 0 0 .29.71L16 13h-2l-3 7h1l3-7h2s1.5 1.5 1.5 3.5S17.5 20 17.5 20h1s-1-2-1-4.5.5-3.5 1.5-3.5h2l-3-7z" />
                        </svg>
                    </button>
                    <button
                        className="event-card__btn"
                        onClick={(e) => { e.stopPropagation(); onDuplicate(event.id); }}
                        title="复制"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    </button>
                    <button
                        className="event-card__btn"
                        onClick={(e) => { e.stopPropagation(); onExportCal(event); }}
                        title="导出到日历"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>
                    <button
                        className={`event-card__btn ${event.archived ? 'event-card__btn--active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onArchive(event.id); }}
                        title={event.archived ? '从归档移出' : '归档'}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="21 8 21 21 3 21 3 8" />
                            <rect x="1" y="3" width="22" height="5" />
                            <line x1="10" y1="12" x2="14" y2="12" />
                        </svg>
                    </button>
                    <button
                        className="event-card__btn"
                        onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                        title="编辑"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        className="event-card__btn event-card__btn--danger"
                        onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
                        title="删除"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>

            <h3 className="event-card__name">{event.name}</h3>

            {/* Date + Natural language */}
            <div className="event-card__date-row">
                <div className="event-card__date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{formattedDate} {formattedTime}</span>
                </div>
                <span className="event-card__natural-time">{naturalTime}</span>
            </div>

            {/* Note preview */}
            {event.note && (
                <div className="event-card__note">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="17" y1="10" x2="3" y2="10" />
                        <line x1="21" y1="6" x2="3" y2="6" />
                        <line x1="21" y1="14" x2="3" y2="14" />
                        <line x1="17" y1="18" x2="3" y2="18" />
                    </svg>
                    <span>{event.note.length > 50 ? event.note.slice(0, 50) + '…' : event.note}</span>
                </div>
            )}

            {/* Status + counting info */}
            <div className="event-card__info-row">
                <div className="event-card__status-badge">
                    {diff.isPast ? (
                        <span className="badge badge--past">已过去</span>
                    ) : (
                        <span className="badge badge--future">倒计时</span>
                    )}
                </div>
                <div className="event-card__info-tags">
                    <span className="event-card__info-tag" title={`创建于 ${new Date(event.createdAt).toLocaleDateString('zh-CN')}`}>
                        {createdStr}
                    </span>
                    {totalSpanDays > 0 && (
                        <span className="event-card__info-tag">
                            跨度 {totalSpanDays} 天
                        </span>
                    )}
                </div>
            </div>

            {/* Yearly progress bar for recurring events */}
            {yearlyProgress !== null && (
                <div className="event-card__yearly-progress">
                    <div className="event-card__yearly-bar">
                        <div
                            className="event-card__yearly-fill"
                            style={{ width: `${yearlyProgress}%` }}
                        />
                    </div>
                    <span className="event-card__yearly-label">
                        年度进度 {Math.round(yearlyProgress)}%
                    </span>
                </div>
            )}

            {/* Countdown digits */}
            <div className="event-card__countdown">
                <TimeDigit value={diff.days} label="天" isPast={diff.isPast} />
                <span className="event-card__separator">:</span>
                <TimeDigit value={diff.hours} label="时" isPast={diff.isPast} />
                <span className="event-card__separator">:</span>
                <TimeDigit value={diff.minutes} label="分" isPast={diff.isPast} />
                <span className="event-card__separator">:</span>
                <TimeDigit value={diff.seconds} label="秒" isPast={diff.isPast} />
            </div>

            {/* Shimmer removed for cleaner look */}
        </div>
    );
}
