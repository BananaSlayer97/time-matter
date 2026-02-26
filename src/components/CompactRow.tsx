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

        let text = '';
        if (days > 365) {
            const y = Math.floor(days / 365);
            const d = days % 365;
            text = `${y}年${d}天`;
        } else if (days > 0) {
            text = `${days}天${hours}时`;
        } else if (hours > 0) {
            text = `${hours}时${mins}分`;
        } else {
            text = `${mins}分`;
        }
        return { text, isPast };
    }, [event.targetDate]);

    const catInfo = CATEGORIES[event.category];
    const icon = catInfo?.icon ?? '🏷️';

    return (
        <div className="compact-row" onClick={() => onClick(event)}>
            <span className="compact-row__icon">{icon}</span>
            <span className="compact-row__name">{event.name}</span>
            {event.pinned && <span className="compact-row__pin">📌</span>}
            <span className={`compact-row__time ${diff.isPast ? 'compact-row__time--past' : 'compact-row__time--future'}`}>
                {diff.isPast ? `${diff.text}前` : `${diff.text}后`}
            </span>
        </div>
    );
}
