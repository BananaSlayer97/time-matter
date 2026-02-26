import { useState, useEffect } from 'react';
import './TimeProgress.css';

interface TimeSlot {
    label: string;
    icon: string;
    remaining: string;
    percent: number;
}

/** 根据百分比返回 HSL 颜色：绿(0%) → 黄(50%) → 红(100%) */
function progressColor(percent: number): string {
    const p = Math.min(Math.max(percent, 0), 100);
    // hue: 120(green) → 60(yellow) → 0(red)
    const hue = 120 - (p / 100) * 120;
    return `hsl(${hue}, 80%, 50%)`;
}

function getTimeSlots(now: Date): TimeSlot[] {
    const pad = (n: number) => String(n).padStart(2, '0');

    // ---- 本小时 ----
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    const hourEnd = new Date(hourStart.getTime() + 3600_000);
    const hourElapsed = now.getTime() - hourStart.getTime();
    const hourLeft = hourEnd.getTime() - now.getTime();
    const hourMins = Math.floor(hourLeft / 60_000);
    const hourSecs = Math.floor((hourLeft % 60_000) / 1000);

    // ---- 今天 ----
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400_000);
    const dayElapsed = now.getTime() - dayStart.getTime();
    const dayLeft = dayEnd.getTime() - now.getTime();
    const dayHrs = Math.floor(dayLeft / 3600_000);
    const dayMins = Math.floor((dayLeft % 3600_000) / 60_000);
    const daySecs = Math.floor((dayLeft % 60_000) / 1000);

    // ---- 本周 (周一起) ----
    const wd = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - wd, 0, 0, 0, 0);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400_000);
    const weekElapsed = now.getTime() - weekStart.getTime();
    const weekTotal = weekEnd.getTime() - weekStart.getTime();
    const weekLeft = weekEnd.getTime() - now.getTime();
    const wD = Math.floor(weekLeft / 86400_000);
    const wH = Math.floor((weekLeft % 86400_000) / 3600_000);
    const wM = Math.floor((weekLeft % 3600_000) / 60_000);
    const wS = Math.floor((weekLeft % 60_000) / 1000);

    // ---- 本月 ----
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    const monthTotal = monthEnd.getTime() - monthStart.getTime();
    const monthElapsed = now.getTime() - monthStart.getTime();
    const monthLeft = monthEnd.getTime() - now.getTime();
    const mD = Math.floor(monthLeft / 86400_000);
    const mH = Math.floor((monthLeft % 86400_000) / 3600_000);
    const mM = Math.floor((monthLeft % 3600_000) / 60_000);
    const mS = Math.floor((monthLeft % 60_000) / 1000);

    // ---- 本季度 ----
    const quarter = Math.floor(now.getMonth() / 3);
    const qStart = new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
    const qEnd = new Date(now.getFullYear(), quarter * 3 + 3, 1, 0, 0, 0, 0);
    const qTotal = qEnd.getTime() - qStart.getTime();
    const qElapsed = now.getTime() - qStart.getTime();
    const qLeft = qEnd.getTime() - now.getTime();
    const qD = Math.floor(qLeft / 86400_000);
    const qH = Math.floor((qLeft % 86400_000) / 3600_000);
    const qM = Math.floor((qLeft % 3600_000) / 60_000);
    const qS = Math.floor((qLeft % 60_000) / 1000);

    // ---- 本年 ----
    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    const yearTotal = yearEnd.getTime() - yearStart.getTime();
    const yearElapsed = now.getTime() - yearStart.getTime();
    const yearLeft = yearEnd.getTime() - now.getTime();
    const yD = Math.floor(yearLeft / 86400_000);
    const yH = Math.floor((yearLeft % 86400_000) / 3600_000);
    const yM = Math.floor((yearLeft % 3600_000) / 60_000);
    const yS = Math.floor((yearLeft % 60_000) / 1000);

    return [
        { label: '本小时', icon: '⏱', remaining: `${pad(hourMins)}:${pad(hourSecs)}`, percent: (hourElapsed / 3600_000) * 100 },
        { label: '今天', icon: '☀️', remaining: `${pad(dayHrs)}:${pad(dayMins)}:${pad(daySecs)}`, percent: (dayElapsed / 86400_000) * 100 },
        { label: '本周', icon: '📅', remaining: `${wD}天 ${pad(wH)}:${pad(wM)}:${pad(wS)}`, percent: (weekElapsed / weekTotal) * 100 },
        { label: '本月', icon: '🗓', remaining: `${mD}天 ${pad(mH)}:${pad(mM)}:${pad(mS)}`, percent: (monthElapsed / monthTotal) * 100 },
        { label: `Q${quarter + 1}`, icon: '📊', remaining: `${qD}天 ${pad(qH)}:${pad(qM)}:${pad(qS)}`, percent: (qElapsed / qTotal) * 100 },
        { label: '本年', icon: '🌍', remaining: `${yD}天 ${pad(yH)}:${pad(yM)}:${pad(yS)}`, percent: (yearElapsed / yearTotal) * 100 },
    ];
}

const STORAGE_KEY = 'tm-time-progress-collapsed';

export function TimeProgress() {
    const [slots, setSlots] = useState<TimeSlot[]>(() => getTimeSlots(new Date()));
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');

    useEffect(() => {
        const timer = setInterval(() => setSlots(getTimeSlots(new Date())), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggle = () => {
        setCollapsed(prev => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
            return next;
        });
    };

    return (
        <div className="time-progress">
            <button className="time-progress__header" onClick={toggle} type="button">
                <div className="time-progress__title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    时间流逝
                </div>
                <svg
                    className={`time-progress__chevron ${collapsed ? 'collapsed' : ''}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            <div className={`time-progress__body ${collapsed ? 'time-progress__body--collapsed' : ''}`}>
                <div className="time-progress__grid">
                    {slots.map((slot) => {
                        const color = progressColor(slot.percent);
                        return (
                            <div key={slot.label} className="tp-card">
                                <div className="tp-card__header">
                                    <span className="tp-card__icon">{slot.icon}</span>
                                    <span className="tp-card__label">{slot.label}</span>
                                </div>
                                <div className="tp-card__remaining">{slot.remaining}</div>
                                <div className="tp-card__bar-track">
                                    <div
                                        className="tp-card__bar-fill"
                                        style={{
                                            width: `${Math.min(slot.percent, 100)}%`,
                                            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                            boxShadow: `0 0 8px ${color}66`,
                                        }}
                                    />
                                </div>
                                <div className="tp-card__percent" style={{ color }}>{slot.percent.toFixed(1)}% 已过</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
