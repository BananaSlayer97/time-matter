import './EmptyState.css';

interface EmptyStateProps {
    onAdd: () => void;
    onOpenTemplates: () => void;
}

export function EmptyState({ onAdd, onOpenTemplates }: EmptyStateProps) {
    return (
        <div className="empty-state">
            <div className="empty-state__orb" />
            <div className="empty-state__icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            </div>
            <h2 className="empty-state__title">时间在此流淌</h2>
            <p className="empty-state__desc">
                添加你关注的重要时刻，<br />
                让每一秒都清晰可见。
            </p>
            <div className="empty-state__actions">
                <button className="empty-state__btn" onClick={onAdd}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    自定义创建
                </button>
                <button className="empty-state__btn empty-state__btn--template" onClick={onOpenTemplates}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    从模板添加
                </button>
            </div>
        </div>
    );
}
