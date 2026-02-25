import { useRef, useCallback } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { CATEGORIES } from '../types';
import type { TimeEvent } from '../types';
import { TimeDigit } from './TimeDigit';
import { ProgressRing } from './ProgressRing';
import './EventDetail.css';

interface EventDetailProps {
    event: TimeEvent;
    onClose: () => void;
    onEdit: (event: TimeEvent) => void;
}

function getNextRecurringDate(dateStr: string): string {
    const target = new Date(dateStr);
    const now = new Date();
    const thisYear = new Date(
        now.getFullYear(),
        target.getMonth(),
        target.getDate(),
        target.getHours(),
        target.getMinutes()
    );
    if (thisYear.getTime() > now.getTime()) {
        return thisYear.toISOString();
    }
    return new Date(
        now.getFullYear() + 1,
        target.getMonth(),
        target.getDate(),
        target.getHours(),
        target.getMinutes()
    ).toISOString();
}

function getYearProgress(dateStr: string): number {
    const target = new Date(dateStr);
    const now = new Date();
    const thisYearEvent = new Date(
        now.getFullYear(),
        target.getMonth(),
        target.getDate(),
        target.getHours(),
        target.getMinutes()
    );
    const lastYearEvent = new Date(
        now.getFullYear() - 1,
        target.getMonth(),
        target.getDate(),
        target.getHours(),
        target.getMinutes()
    );
    const nextYearEvent = new Date(
        now.getFullYear() + 1,
        target.getMonth(),
        target.getDate(),
        target.getHours(),
        target.getMinutes()
    );

    if (now >= thisYearEvent) {
        const total = nextYearEvent.getTime() - thisYearEvent.getTime();
        const elapsed = now.getTime() - thisYearEvent.getTime();
        return (elapsed / total) * 100;
    } else {
        const total = thisYearEvent.getTime() - lastYearEvent.getTime();
        const elapsed = now.getTime() - lastYearEvent.getTime();
        return (elapsed / total) * 100;
    }
}

export function EventDetail({ event, onClose, onEdit }: EventDetailProps) {
    const isRecurring = event.recurring === 'yearly';
    const effectiveDate = isRecurring
        ? getNextRecurringDate(event.targetDate)
        : event.targetDate;
    const diff = useCountdown(effectiveDate);
    const category = CATEGORIES[event.category];
    const detailRef = useRef<HTMLDivElement>(null);
    const yearProgress = isRecurring ? getYearProgress(event.targetDate) : 0;

    const targetDateObj = new Date(event.targetDate);
    const formattedDate = targetDateObj.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    });
    const formattedTime = targetDateObj.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleShare = useCallback(async () => {
        const el = detailRef.current;
        if (!el) return;

        try {
            // Dynamic import html2canvas
            const html2canvasModule = await import('html2canvas');
            const html2canvas = html2canvasModule.default;

            const canvas = await html2canvas(el, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                logging: false,
            });

            canvas.toBlob((blob) => {
                if (!blob) return;
                if (navigator.share) {
                    const file = new File([blob], `${event.name}.png`, { type: 'image/png' });
                    navigator.share({ files: [file], title: event.name }).catch(() => { });
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${event.name}.png`;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 200);
                }
            }, 'image/png');
        } catch {
            alert('分享功能加载失败，请检查网络连接');
        }
    }, [event.name]);

    // Calculate days since creation
    const createdDate = new Date(event.createdAt);
    const daysSinceCreation = Math.floor(
        (Date.now() - createdDate.getTime()) / 86400000
    );

    return (
        <div className="detail-overlay" onClick={handleOverlayClick}>
            <div className="detail-modal">
                {/* Close button */}
                <button className="detail-close" onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Shareable content area */}
                <div className="detail-content" ref={detailRef}>
                    {/* Accent gradient bar */}
                    <div className="detail-accent" style={{ background: category.gradient }} />

                    <div className="detail-header">
                        <span className="detail-icon">{category.icon}</span>
                        <div>
                            <span className="detail-category">{category.label}</span>
                            {isRecurring && <span className="detail-recurring-badge">🔁 每年</span>}
                        </div>
                    </div>

                    <h2 className="detail-name">{event.name}</h2>

                    <div className="detail-date-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{formattedDate} {formattedTime}</span>
                    </div>

                    {event.note && (
                        <p className="detail-note">{event.note}</p>
                    )}

                    <div className="detail-status">
                        {diff.isPast && !isRecurring ? (
                            <span className="detail-badge detail-badge--past">已过去</span>
                        ) : (
                            <span className="detail-badge detail-badge--future">
                                {isRecurring ? '下次' : ''}倒计时
                            </span>
                        )}
                    </div>

                    {/* Big countdown */}
                    <div className="detail-countdown">
                        <TimeDigit value={diff.days} label="天" isPast={diff.isPast && !isRecurring} />
                        <span className="detail-sep">:</span>
                        <TimeDigit value={diff.hours} label="时" isPast={diff.isPast && !isRecurring} />
                        <span className="detail-sep">:</span>
                        <TimeDigit value={diff.minutes} label="分" isPast={diff.isPast && !isRecurring} />
                        <span className="detail-sep">:</span>
                        <TimeDigit value={diff.seconds} label="秒" isPast={diff.isPast && !isRecurring} />
                    </div>

                    {/* Progress ring for recurring events */}
                    {isRecurring && (
                        <div className="detail-progress">
                            <ProgressRing percentage={yearProgress} size={64} strokeWidth={4} />
                            <span className="detail-progress-label">年度周期进度</span>
                        </div>
                    )}

                    {/* Timeline info */}
                    <div className="detail-timeline">
                        <div className="detail-timeline-item">
                            <span className="detail-timeline-label">创建于</span>
                            <span className="detail-timeline-value">
                                {createdDate.toLocaleDateString('zh-CN')}
                                {daysSinceCreation > 0 && ` (${daysSinceCreation} 天前)`}
                            </span>
                        </div>
                    </div>

                    {/* Watermark */}
                    <div className="detail-watermark">Time Matter</div>
                </div>

                {/* Action buttons (outside shareable area) */}
                <div className="detail-actions">
                    <button className="detail-btn" onClick={() => { onEdit(event); onClose(); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        编辑
                    </button>
                    <button className="detail-btn detail-btn--primary" onClick={handleShare}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        分享海报
                    </button>
                </div>
            </div>
        </div>
    );
}
