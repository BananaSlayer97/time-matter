import { useState, useRef, useEffect } from 'react';
import './SettingsMenu.css';

interface SettingsMenuProps {
    onExport: () => void;
    onImport: () => void;
    onRequestNotifications: () => Promise<boolean>;
    notificationPermission: NotificationPermission;
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
}

export function SettingsMenu({
    onExport,
    onImport,
    onRequestNotifications,
    notificationPermission,
    theme,
    onToggleTheme,
}: SettingsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleNotification = async () => {
        const granted = await onRequestNotifications();
        if (granted) {
            setIsOpen(false);
        }
    };

    const notifLabel =
        notificationPermission === 'granted'
            ? '通知已开启'
            : notificationPermission === 'denied'
                ? '通知已被拒绝'
                : '开启通知提醒';

    const notifDisabled = notificationPermission === 'granted' || notificationPermission === 'denied';

    return (
        <div className="settings-menu" ref={menuRef}>
            <button
                className="settings-menu__trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="设置"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            </button>

            {isOpen && (
                <div className="settings-menu__dropdown">
                    <button className="settings-menu__item" onClick={() => { onExport(); setIsOpen(false); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>导出数据</span>
                    </button>

                    <button className="settings-menu__item" onClick={() => { onImport(); setIsOpen(false); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>导入数据</span>
                    </button>

                    <div className="settings-menu__divider" />

                    <button className="settings-menu__item" onClick={() => { onToggleTheme(); setIsOpen(false); }}>
                        {theme === 'dark' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                        <span>{theme === 'dark' ? '切换亮色模式' : '切换暗色模式'}</span>
                    </button>

                    <div className="settings-menu__divider" />

                    <button
                        className={`settings-menu__item ${notifDisabled ? 'disabled' : ''}`}
                        onClick={handleNotification}
                        disabled={notifDisabled}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span>{notifLabel}</span>
                        {notificationPermission === 'granted' && (
                            <span className="settings-menu__badge">✓</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
