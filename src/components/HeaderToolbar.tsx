import { useState } from 'react';
import type { Theme } from '../hooks/useTheme';
import { THEME_OPTIONS } from '../hooks/useTheme';
import type { User } from '@supabase/supabase-js';
import './HeaderToolbar.css';

interface HeaderToolbarProps {
    // Theme
    theme: Theme;
    onSetTheme: (t: Theme) => void;
    // Data
    onExport: () => void;
    onImport: () => void;
    onManageCategories: () => void;
    // Notification
    onRequestNotifications: () => Promise<boolean>;
    notificationPermission: NotificationPermission;
    // Auth
    user: User | null;
    onOpenAuth: () => void;
    onSignOut: () => void;
    // Sync
    syncing: boolean;
    lastSync: string | null;
    onPush: () => void;
    onPull: () => void;
}

export function HeaderToolbar({
    theme,
    onSetTheme,
    onExport,
    onImport,
    onManageCategories,
    onRequestNotifications,
    notificationPermission,
    user,
    onOpenAuth,
    onSignOut,
    syncing,
    lastSync,
    onPush,
    onPull,
}: HeaderToolbarProps) {
    const [showThemes, setShowThemes] = useState(false);

    const formatLastSync = (iso: string | null) => {
        if (!iso) return '从未';
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    const currentTheme = THEME_OPTIONS.find(t => t.id === theme);

    return (
        <div className="htoolbar">
            {/* Theme button with popover */}
            <div className="htoolbar__group htoolbar__theme-wrap">
                <button
                    className={`htoolbar__btn ${showThemes ? 'active' : ''}`}
                    onClick={() => setShowThemes(!showThemes)}
                    title="切换主题"
                >
                    <span className="htoolbar__btn-icon">{currentTheme?.icon ?? '🎨'}</span>
                    <span className="htoolbar__btn-label">{currentTheme?.label ?? '主题'}</span>
                </button>
                {showThemes && (
                    <div className="htoolbar__theme-pop">
                        {THEME_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                className={`htoolbar__theme-opt ${theme === opt.id ? 'active' : ''}`}
                                onClick={() => { onSetTheme(opt.id); setShowThemes(false); }}
                                title={opt.desc}
                            >
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="htoolbar__sep" />

            {/* Data group */}
            <div className="htoolbar__group">
                <button className="htoolbar__btn" onClick={onExport} title="导出 JSON">
                    <span className="htoolbar__btn-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </span>
                    <span className="htoolbar__btn-label">导出</span>
                </button>
                <button className="htoolbar__btn" onClick={onImport} title="导入 JSON">
                    <span className="htoolbar__btn-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </span>
                    <span className="htoolbar__btn-label">导入</span>
                </button>
                <button className="htoolbar__btn" onClick={onManageCategories} title="分类管理">
                    <span className="htoolbar__btn-icon">🏷️</span>
                    <span className="htoolbar__btn-label">分类</span>
                </button>
            </div>

            <div className="htoolbar__sep" />

            {/* Notification */}
            <div className="htoolbar__group">
                <button
                    className={`htoolbar__btn ${notificationPermission === 'granted' ? 'htoolbar__btn--ok' : ''}`}
                    onClick={onRequestNotifications}
                    disabled={notificationPermission === 'granted' || notificationPermission === 'denied'}
                    title={notificationPermission === 'granted' ? '通知已开启' : '开启通知'}
                >
                    <span className="htoolbar__btn-icon">🔔</span>
                    <span className="htoolbar__btn-label">
                        {notificationPermission === 'granted' ? '已开启' : notificationPermission === 'denied' ? '已拒绝' : '通知'}
                    </span>
                </button>
            </div>

            <div className="htoolbar__spacer" />

            {/* Auth + Sync */}
            <div className="htoolbar__group">
                {user ? (
                    <>
                        <button className="htoolbar__btn" onClick={onPush} disabled={syncing} title="上传到云端">
                            <span className="htoolbar__btn-icon">⬆️</span>
                            <span className="htoolbar__btn-label">{syncing ? '...' : '上传'}</span>
                        </button>
                        <button className="htoolbar__btn" onClick={onPull} disabled={syncing} title="从云端下载">
                            <span className="htoolbar__btn-icon">⬇️</span>
                            <span className="htoolbar__btn-label">{syncing ? '...' : '下载'}</span>
                        </button>
                        <div className="htoolbar__user">
                            <span className="htoolbar__avatar">
                                {user.email?.charAt(0).toUpperCase() || '?'}
                            </span>
                            <span className="htoolbar__sync-time">{formatLastSync(lastSync)}</span>
                        </div>
                        <button className="htoolbar__btn htoolbar__btn--ghost" onClick={onSignOut} title="退出登录">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <button className="htoolbar__btn htoolbar__btn--accent" onClick={onOpenAuth}>
                        <span className="htoolbar__btn-icon">👤</span>
                        <span className="htoolbar__btn-label">登录</span>
                    </button>
                )}
            </div>
        </div>
    );
}
