import { useState, useEffect } from 'react';
import './TimeProgress.css';

interface TimeSlot {
    label: string;
    icon: string;
    remaining: string;
    elapsed: string;
    percent: number;
    detail: string; // extra context line
}

/** 根据百分比返回 HSL 颜色：绿(0%) → 黄(50%) → 红(100%) */
function progressColor(percent: number): string {
    const p = Math.min(Math.max(percent, 0), 100);
    const hue = 120 - (p / 100) * 120;
    return `hsl(${hue}, 72%, 52%)`;
}

function getTimeSlots(now: Date): TimeSlot[] {
    const pad = (n: number) => String(n).padStart(2, '0');

    // ---- 本小时 ----
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    const hourElapsed = now.getTime() - hourStart.getTime();
    const hourLeft = 3600_000 - hourElapsed;
    const hourMins = Math.floor(hourLeft / 60_000);
    const hourSecs = Math.floor((hourLeft % 60_000) / 1000);
    const hourPercent = (hourElapsed / 3600_000) * 100;
    const elapsedMins = Math.floor(hourElapsed / 60_000);

    // ---- 今天 ----
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const dayElapsed = now.getTime() - dayStart.getTime();
    const dayLeft = 86400_000 - dayElapsed;
    const dayHrs = Math.floor(dayLeft / 3600_000);
    const dayMins = Math.floor((dayLeft % 3600_000) / 60_000);
    const daySecs = Math.floor((dayLeft % 60_000) / 1000);
    const dayPercent = (dayElapsed / 86400_000) * 100;
    const elapsedHrs = Math.floor(dayElapsed / 3600_000);

    // ---- 本周 (周一起) ----
    const wd = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - wd, 0, 0, 0, 0);
    const weekTotal = 7 * 86400_000;
    const weekElapsed = now.getTime() - weekStart.getTime();
    const weekLeft = weekTotal - weekElapsed;
    const wD = Math.floor(weekLeft / 86400_000);
    const wH = Math.floor((weekLeft % 86400_000) / 3600_000);
    const weekPercent = (weekElapsed / weekTotal) * 100;
    const weekDayNames = ['一', '二', '三', '四', '五', '六', '日'];

    // ---- 本月 ----
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    const monthTotal = monthEnd.getTime() - monthStart.getTime();
    const monthElapsed = now.getTime() - monthStart.getTime();
    const monthLeft = monthEnd.getTime() - now.getTime();
    const mD = Math.floor(monthLeft / 86400_000);
    const monthPercent = (monthElapsed / monthTotal) * 100;
    const totalDaysInMonth = Math.round(monthTotal / 86400_000);

    // ---- 本季度 ----
    const quarter = Math.floor(now.getMonth() / 3);
    const qStart = new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
    const qEnd = new Date(now.getFullYear(), quarter * 3 + 3, 1, 0, 0, 0, 0);
    const qTotal = qEnd.getTime() - qStart.getTime();
    const qElapsed = now.getTime() - qStart.getTime();
    const qLeft = qEnd.getTime() - now.getTime();
    const qD = Math.floor(qLeft / 86400_000);
    const qPercent = (qElapsed / qTotal) * 100;

    // ---- 本年 ----
    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    const yearTotal = yearEnd.getTime() - yearStart.getTime();
    const yearElapsed = now.getTime() - yearStart.getTime();
    const yearLeft = yearEnd.getTime() - now.getTime();
    const yD = Math.floor(yearLeft / 86400_000);
    const yearPercent = (yearElapsed / yearTotal) * 100;
    const dayOfYear = Math.floor(yearElapsed / 86400_000) + 1;
    const totalDaysInYear = Math.round(yearTotal / 86400_000);

    return [
        {
            label: '本小时', icon: '⏱',
            remaining: `${pad(hourMins)}:${pad(hourSecs)}`,
            elapsed: `已过 ${elapsedMins} 分钟`,
            percent: hourPercent,
            detail: `${now.getHours()}:00 – ${now.getHours() + 1}:00`,
        },
        {
            label: '今天', icon: '☀️',
            remaining: `${pad(dayHrs)}:${pad(dayMins)}:${pad(daySecs)}`,
            elapsed: `已过 ${elapsedHrs} 小时`,
            percent: dayPercent,
            detail: `${now.getMonth() + 1}月${now.getDate()}日 · 周${weekDayNames[wd]}`,
        },
        {
            label: '本周', icon: '📅',
            remaining: `${wD}天 ${pad(wH)}时`,
            elapsed: `第 ${wd + 1} / 7 天`,
            percent: weekPercent,
            detail: `周${weekDayNames[wd]} · 还剩${wD}天`,
        },
        {
            label: '本月', icon: '🗓',
            remaining: `剩余 ${mD} 天`,
            elapsed: `第 ${now.getDate()} / ${totalDaysInMonth} 天`,
            percent: monthPercent,
            detail: `${now.getFullYear()}年${now.getMonth() + 1}月`,
        },
        {
            label: `Q${quarter + 1}`, icon: '📊',
            remaining: `剩余 ${qD} 天`,
            elapsed: `季度进度`,
            percent: qPercent,
            detail: `${quarter * 3 + 1}–${quarter * 3 + 3}月`,
        },
        {
            label: '本年', icon: '🌍',
            remaining: `剩余 ${yD} 天`,
            elapsed: `第 ${dayOfYear} / ${totalDaysInYear} 天`,
            percent: yearPercent,
            detail: `${now.getFullYear()}年`,
        },
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
                                    <span className="tp-card__percent-badge" style={{ color }}>
                                        {slot.percent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="tp-card__remaining">{slot.remaining}</div>
                                <div className="tp-card__detail">{slot.detail}</div>
                                <div className="tp-card__bar-track">
                                    <div
                                        className="tp-card__bar-fill"
                                        style={{
                                            width: `${Math.min(slot.percent, 100)}%`,
                                            background: color,
                                            boxShadow: `0 0 8px ${color}`,
                                            opacity: 0.9,
                                        }}
                                    />
                                </div>
                                <div className="tp-card__elapsed">{slot.elapsed}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
