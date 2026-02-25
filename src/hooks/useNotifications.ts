import { useEffect, useRef, useCallback } from 'react';
import type { TimeEvent } from '../types';

const NOTIFICATION_THRESHOLDS = [
    { label: '1天', seconds: 86400 },
    { label: '1小时', seconds: 3600 },
    { label: '10分钟', seconds: 600 },
    { label: '1分钟', seconds: 60 },
];

const NOTIFIED_KEY = 'time-matter-notified';

function getNotifiedSet(): Set<string> {
    try {
        const raw = localStorage.getItem(NOTIFIED_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (_err) {
        return new Set();
    }
}

function saveNotifiedSet(set: Set<string>) {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]));
}

export function useNotifications(events: TimeEvent[]) {
    const permissionRef = useRef<NotificationPermission>('default');
    const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') {
            permissionRef.current = 'granted';
            return true;
        }
        if (Notification.permission === 'denied') return false;

        const result = await Notification.requestPermission();
        permissionRef.current = result;
        return result === 'granted';
    }, []);

    const sendNotification = useCallback((title: string, body: string, icon?: string) => {
        if (permissionRef.current !== 'granted') return;

        // Try service worker notification first (works in background)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(title, {
                    body,
                    icon: icon || '/icons/icon-192.svg',
                    badge: '/icons/icon-192.svg',
                    tag: title,
                });
            });
        } else {
            // Fallback to regular notification
            new Notification(title, {
                body,
                icon: icon || '/icons/icon-192.svg',
            });
        }
    }, []);

    useEffect(() => {
        if (!('Notification' in window)) return;
        permissionRef.current = Notification.permission;

        const checkEvents = () => {
            if (permissionRef.current !== 'granted') return;

            const now = Date.now();
            const notified = getNotifiedSet();
            let changed = false;

            for (const event of events) {
                const target = new Date(event.targetDate).getTime();
                const diff = target - now;

                // Only check future events
                if (diff <= 0) continue;

                for (const threshold of NOTIFICATION_THRESHOLDS) {
                    const key = `${event.id}-${threshold.seconds}`;
                    if (notified.has(key)) continue;

                    // Notify when we're within threshold (and within 30s of crossing it)
                    if (diff <= threshold.seconds * 1000 && diff > (threshold.seconds - 30) * 1000) {
                        sendNotification(
                            `⏳ ${event.name}`,
                            `距离「${event.name}」还有 ${threshold.label}！`
                        );
                        notified.add(key);
                        changed = true;
                    }
                }
            }

            if (changed) {
                saveNotifiedSet(notified);
            }
        };

        // Check every 15 seconds
        intervalRef.current = setInterval(checkEvents, 15000);
        checkEvents();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [events, sendNotification]);

    return { requestPermission, permissionStatus: permissionRef.current };
}
