import { useState, useRef, useEffect } from 'react';
import type { Theme } from '../hooks/useTheme';
import { THEME_OPTIONS } from '../hooks/useTheme';
import type { User } from '@supabase/supabase-js';
import './SettingsMenu.css';

interface SettingsMenuProps {
    onExport: () => void;
    onImport: () => void;
    onRequestNotifications: () => Promise<boolean>;
    notificationPermission: NotificationPermission;
    theme: Theme;
    onSetTheme: (t: Theme) => void;
    onManageCategories: () => void;
    // Auth + Sync
    user: User | null;
    onOpenAuth: () => void;
    onSignOut: () => void;
    syncing: boolean;
    lastSync: string | null;
    onPush: () => void;
    onPull: () => void;
}

export function SettingsMenu({
    onExport,
    onImport,
    onRequestNotifications,
    notificationPermission,
    theme,
    onSetTheme,
    onManageCategories,
    user,
    onOpenAuth,
    onSignOut,
    syncing,
    lastSync,
    onPush,
    onPull,
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
        if (granted) setIsOpen(false);
    };

    const notifLabel =
        notificationPermission === 'granted' ? '通知已开启'
            : notificationPermission === 'denied' ? '通知已被拒绝'
                : '开启通知提醒';

    const notifDisabled = notificationPermission === 'granted' || notificationPermission === 'denied';

    const formatLastSync = (iso: string | null) => {
        if (!iso) return '从未同步';
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const DD = String(d.getDate()).padStart(2, '0');
        return `${MM}-${DD} ${hh}:${mm}`;
    };

    return (
        <div className="settings-menu" ref={menuRef}>
            <button className="settings-menu__trigger" onClick={() => setIsOpen(!isOpen)} aria-label="设置">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            </button>

            {isOpen && (
                <div className="settings-menu__dropdown">
                    {/* Account Section */}
                    <div className="settings-menu__section-label">账号</div>
                    {user ? (
                        <div className="settings-menu__account">
                            <div className="settings-menu__account-info">
                                <span className="settings-menu__account-avatar">
                                    {user.email?.charAt(0).toUpperCase() || '?'}
                                </span>
                                <div className="settings-menu__account-details">
                                    <span className="settings-menu__account-email">{user.email}</span>
                                    <span className="settings-menu__account-sync-time">
                                        上次同步: {formatLastSync(lastSync)}
                                    </span>
                                </div>
                            </div>

                            {/* Sync buttons */}
                            <div className="settings-menu__sync-row">
                                <button
                                    className="settings-menu__sync-btn"
                                    onClick={() => { onPush(); setIsOpen(false); }}
                                    disabled={syncing}
                                    title="本地数据覆盖云端"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="17 1 21 5 17 9" />
                                        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                                    </svg>
                                    {syncing ? '...' : '↑ 上传'}
                                </button>
                                <button
                                    className="settings-menu__sync-btn"
                                    onClick={() => { onPull(); setIsOpen(false); }}
                                    disabled={syncing}
                                    title="云端数据覆盖本地"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="7 23 3 19 7 15" />
                                        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                                    </svg>
                                    {syncing ? '...' : '↓ 下载'}
                                </button>
                            </div>

                            <button className="settings-menu__item settings-menu__item--danger" onClick={() => { onSignOut(); setIsOpen(false); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                <span>退出登录</span>
                            </button>
                        </div>
                    ) : (
                        <button className="settings-menu__item settings-menu__item--accent" onClick={() => { onOpenAuth(); setIsOpen(false); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>登录 / 注册</span>
                            <span className="settings-menu__badge-new">云同步</span>
                        </button>
                    )}

                    <div className="settings-menu__divider" />

                    {/* Theme Picker */}
                    <div className="settings-menu__section-label">主题</div>
                    <div className="settings-menu__theme-grid">
                        {THEME_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                className={`settings-menu__theme-btn ${theme === opt.id ? 'active' : ''}`}
                                onClick={() => onSetTheme(opt.id)}
                                title={opt.desc}
                            >
                                <span className="settings-menu__theme-icon">{opt.icon}</span>
                                <span className="settings-menu__theme-name">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="settings-menu__divider" />

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

                    <button className="settings-menu__item" onClick={() => { onManageCategories(); setIsOpen(false); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        <span>分类管理</span>
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
