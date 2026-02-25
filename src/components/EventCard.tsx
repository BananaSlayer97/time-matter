import { useCountdown } from '../hooks/useCountdown';
import { CATEGORIES } from '../types';
import type { TimeEvent } from '../types';
import { TimeDigit } from './TimeDigit';
import './EventCard.css';

interface EventCardProps {
    event: TimeEvent;
    onEdit: (event: TimeEvent) => void;
    onDelete: (id: string) => void;
    onClick: (event: TimeEvent) => void;
    index: number;
}

export function EventCard({ event, onEdit, onDelete, onClick, index }: EventCardProps) {
    const diff = useCountdown(event.targetDate);
    const category = CATEGORIES[event.category];

    const targetDateObj = new Date(event.targetDate);
    const formattedDate = targetDateObj.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = targetDateObj.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            className={`event-card ${diff.isPast ? 'event-card--past' : 'event-card--future'}`}
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
                        className="event-card__btn"
                        onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                        title="编辑"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            <div className="event-card__date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{formattedDate} {formattedTime}</span>
            </div>

            <div className="event-card__status-badge">
                {diff.isPast ? (
                    <span className="badge badge--past">已过去</span>
                ) : (
                    <span className="badge badge--future">倒计时</span>
                )}
            </div>

            <div className="event-card__countdown">
                <TimeDigit value={diff.days} label="天" isPast={diff.isPast} />
                <span className="event-card__separator">:</span>
                <TimeDigit value={diff.hours} label="时" isPast={diff.isPast} />
                <span className="event-card__separator">:</span>
                <TimeDigit value={diff.minutes} label="分" isPast={diff.isPast} />
                <span className="event-card__separator">:</span>
                <TimeDigit value={diff.seconds} label="秒" isPast={diff.isPast} />
            </div>

            {/* Progress shimmer effect */}
            <div className="event-card__shimmer" />
        </div>
    );
}
