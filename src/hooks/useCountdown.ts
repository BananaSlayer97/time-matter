import { useMemo } from 'react';
import { useGlobalTick } from '../context/GlobalTickContext';
import type { TimeDiff } from '../types';

export function useCountdown(targetDate: string): TimeDiff {
    const now = useGlobalTick();

    return useMemo(() => {
        const target = new Date(targetDate).getTime();
        const diff = target - now;
        const isPast = diff < 0;
        const absDiff = Math.abs(diff);

        const totalSeconds = Math.floor(absDiff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return { isPast, totalSeconds, days, hours, minutes, seconds };
    }, [targetDate, now]);
}
