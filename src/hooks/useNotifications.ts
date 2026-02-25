import { useEffect, useRef, useCallback } from 'react';
import type { TimeEvent } from '../types';

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

                // Per-event custom reminder
                if (event.reminderMinutes && event.reminderMinutes > 0) {
                    const reminderMs = event.reminderMinutes * 60 * 1000;
                    const key = `${event.id}-custom-${event.reminderMinutes}`;
                    if (!notified.has(key)) {
                        // Fire when we're within the reminder window (30s tolerance)
                        if (diff <= reminderMs && diff > (reminderMs - 30000)) {
                            const label = event.reminderMinutes >= 1440
                                ? `${Math.floor(event.reminderMinutes / 1440)} 天`
                                : event.reminderMinutes >= 60
                                    ? `${Math.floor(event.reminderMinutes / 60)} 小时`
                                    : `${event.reminderMinutes} 分钟`;
                            sendNotification(
                                `⏰ ${event.name}`,
                                `距离「${event.name}」还有 ${label}！`
                            );
                            notified.add(key);
                            changed = true;
                        }
                    }
                }

                // Default thresholds (fallback for events without custom reminder)
                if (!event.reminderMinutes) {
                    const defaultThresholds = [
                        { label: '1天', seconds: 86400 },
                        { label: '1小时', seconds: 3600 },
                        { label: '10分钟', seconds: 600 },
                    ];
                    for (const threshold of defaultThresholds) {
                        const key = `${event.id}-${threshold.seconds}`;
                        if (notified.has(key)) continue;
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
            }

            if (changed) {
                saveNotifiedSet(notified);
            }
        };

        intervalRef.current = setInterval(checkEvents, 15000);
        checkEvents();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [events, sendNotification]);

    return { requestPermission, permissionStatus: permissionRef.current };
}
