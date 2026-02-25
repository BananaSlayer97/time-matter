import { useState, useEffect, useRef } from 'react';
import type { TimeDiff } from '../types';

export function useCountdown(targetDate: string): TimeDiff {
    const calcDiff = (): TimeDiff => {
        const now = Date.now();
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
    };

    const [diff, setDiff] = useState<TimeDiff>(calcDiff);
    const rafRef = useRef<number>(0);
    const lastSecondRef = useRef<number>(-1);

    useEffect(() => {
        const tick = () => {
            const newDiff = calcDiff();
            // Only update state once per second to avoid excessive re-renders
            if (newDiff.totalSeconds !== lastSecondRef.current) {
                lastSecondRef.current = newDiff.totalSeconds;
                setDiff(newDiff);
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
        };
    }, [targetDate]);

    return diff;
}
