import { useMemo } from 'react';
import type { TimeEvent } from '../types';
import { CATEGORIES } from '../types';
import './CompactRow.css';

interface CompactRowProps {
    event: TimeEvent;
    onClick: (event: TimeEvent) => void;
}

export function CompactRow({ event, onClick }: CompactRowProps) {
    const diff = useMemo(() => {
        const now = Date.now();
        const target = new Date(event.targetDate).getTime();
        const delta = Math.abs(target - now);
        const isPast = target <= now;
        const days = Math.floor(delta / 86400000);
        const hours = Math.floor((delta % 86400000) / 3600000);
        const mins = Math.floor((delta % 3600000) / 60000);

        const segments: { val: number; unit: string; class: string }[] = [];
        if (days > 365) {
            segments.push({ val: Math.floor(days / 365), unit: '年', class: 'year' });
            segments.push({ val: days % 365, unit: '天', class: 'days' });
        } else if (days > 0) {
            segments.push({ val: days, unit: '天', class: 'days' });
            segments.push({ val: hours, unit: '时', class: 'hours' });
        } else if (hours > 0) {
            segments.push({ val: hours, unit: '时', class: 'hours' });
            segments.push({ val: mins, unit: '分', class: 'minutes' });
        } else {
            segments.push({ val: mins, unit: '分', class: 'minutes' });
        }
        return { segments, isPast };
    }, [event.targetDate]);

    const catInfo = CATEGORIES[event.category];
    const icon = catInfo?.icon ?? '🏷️';

    return (
        <div className="compact-row" onClick={() => onClick(event)}>
            <span className="compact-row__icon">{icon}</span>
            <span className="compact-row__name">{event.name}</span>
            {event.pinned && <span className="compact-row__pin">📌</span>}
            <span className={`compact-row__time ${diff.isPast ? 'compact-row__time--past' : 'compact-row__time--future'}`}>
                {diff.segments.map((s, i) => (
                    <span key={i} className={`compact-row__unit compact-row__unit--${s.class}`}>
                        {s.val}{s.unit}
                    </span>
                ))}
                {diff.isPast ? '前' : '后'}
            </span>
        </div>
    );
}
