import { useState, useMemo } from 'react';
import type { TimeEvent, EventCategory, CategoryInfo } from '../types';
import { CATEGORIES } from '../types';
import './SearchToolbar.css';

type SortBy = 'date-asc' | 'date-desc' | 'name' | 'created';
type ViewMode = 'grid' | 'list';

interface SearchToolbarProps {
    events: TimeEvent[];
    onFilteredEvents: (events: TimeEvent[]) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: 'date-asc', label: '日期 ↑ 最近优先' },
    { value: 'date-desc', label: '日期 ↓ 最远优先' },
    { value: 'name', label: '名称 A→Z' },
    { value: 'created', label: '创建顺序' },
];

export function SearchToolbar({ events, onFilteredEvents, viewMode, onViewModeChange }: SearchToolbarProps) {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortBy>('date-asc');

    const filtered = useMemo(() => {
        let result = [...events];

        // Search
        if (query.trim()) {
            const q = query.toLowerCase();
            result = result.filter(e =>
                e.name.toLowerCase().includes(q) ||
                e.note?.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (activeCategory !== 'all') {
            result = result.filter(e => e.category === activeCategory);
        }

        // Sort
        switch (sortBy) {
            case 'date-asc':
                result.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
                break;
            case 'date-desc':
                result.sort((a, b) => new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime());
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
                break;
            case 'created':
                result.sort((a, b) => a.order - b.order);
                break;
        }

        onFilteredEvents(result);
        return result;
    }, [events, query, activeCategory, sortBy, onFilteredEvents]);

    const categoryEntries = Object.entries(CATEGORIES) as [string, CategoryInfo][];

    return (
        <div className="search-toolbar">
            <div className="search-toolbar__row">
                {/* Search */}
                <div className="search-input-wrap">
                    <svg className="search-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="搜索事件..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        id="search-input"
                    />
                    {query && (
                        <button className="search-clear" onClick={() => setQuery('')}>×</button>
                    )}
                </div>

                {/* Sort + View */}
                <div className="search-toolbar__controls">
                    <select
                        className="search-sort"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as SortBy)}
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <div className="search-view-toggle">
                        <button
                            className={`search-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => onViewModeChange('grid')}
                            title="网格视图"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                            </svg>
                        </button>
                        <button
                            className={`search-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => onViewModeChange('list')}
                            title="列表视图"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Category filter pills */}
            <div className="search-categories">
                <button
                    className={`search-cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                >
                    全部 <span className="search-cat-count">{events.length}</span>
                </button>
                {categoryEntries.map(([key, cat]) => {
                    const count = events.filter(e => e.category === key).length;
                    if (count === 0) return null;
                    return (
                        <button
                            key={key}
                            className={`search-cat-pill ${activeCategory === key ? 'active' : ''}`}
                            onClick={() => setActiveCategory(key)}
                        >
                            {cat.icon} {cat.label} <span className="search-cat-count">{count}</span>
                        </button>
                    );
                })}
            </div>

            {query && filtered.length === 0 && (
                <div className="search-empty">
                    没有找到匹配「{query}」的事件
                </div>
            )}
        </div>
    );
}
