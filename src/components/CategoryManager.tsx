import { useState } from 'react';
import type { CategoryInfo } from '../types';
import './CategoryManager.css';

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    customCategories: Record<string, CategoryInfo>;
    onAdd: (key: string, info: CategoryInfo) => void;
    onRemove: (key: string) => void;
}

const PRESET_GRADIENTS = [
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
];

const PRESET_ICONS = ['⭐', '🏠', '🎓', '🍱', '💊', '🧗', '🎮', '💡', '🎵', '📷', '🧸', '🚲'];

export function CategoryManager({ isOpen, onClose, customCategories, onAdd, onRemove }: CategoryManagerProps) {
    const [newLabel, setNewLabel] = useState('');
    const [newIcon, setNewIcon] = useState(PRESET_ICONS[0]);
    const [newGradient, setNewGradient] = useState(PRESET_GRADIENTS[0]);

    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLabel.trim()) return;

        const key = `custom-${Date.now()}`;
        onAdd(key, {
            label: newLabel.trim(),
            icon: newIcon,
            gradient: newGradient
        });
        setNewLabel('');
    };

    return (
        <div className="cat-manager-overlay" onClick={onClose}>
            <div className="cat-manager-modal" onClick={e => e.stopPropagation()}>
                <div className="cat-manager-header">
                    <h2 className="cat-manager-title">管理分类</h2>
                    <button className="cat-manager-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="cat-manager-body">
                    <form className="cat-manager-form" onSubmit={handleAdd}>
                        <div className="form-group">
                            <label className="form-label">新建分类名称</label>
                            <input
                                className="form-input"
                                type="text"
                                value={newLabel}
                                onChange={e => setNewLabel(e.target.value)}
                                placeholder="分类名称..."
                                maxLength={20}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">选择图标</label>
                            <div className="cat-icon-grid">
                                {PRESET_ICONS.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        className={`cat-icon-btn ${newIcon === icon ? 'active' : ''}`}
                                        onClick={() => setNewIcon(icon)}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">选择颜色方案</label>
                            <div className="cat-grad-grid">
                                {PRESET_GRADIENTS.map(grad => (
                                    <button
                                        key={grad}
                                        type="button"
                                        className={`cat-grad-btn ${newGradient === grad ? 'active' : ''}`}
                                        style={{ background: grad }}
                                        onClick={() => setNewGradient(grad)}
                                    />
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="cat-add-btn" disabled={!newLabel.trim()}>
                            添加分类
                        </button>
                    </form>

                    <div className="cat-list-section">
                        <label className="form-label">现有自定义分类</label>
                        <div className="cat-list">
                            {Object.entries(customCategories).length === 0 ? (
                                <p className="cat-empty">暂无自定义分类</p>
                            ) : (
                                Object.entries(customCategories).map(([key, cat]) => (
                                    <div key={key} className="cat-item">
                                        <div className="cat-item-content">
                                            <span className="cat-item-icon">{cat.icon}</span>
                                            <span className="cat-item-label">{cat.label}</span>
                                        </div>
                                        <button className="cat-item-delete" onClick={() => onRemove(key)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
