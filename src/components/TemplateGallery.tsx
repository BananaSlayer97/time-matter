import { useState } from 'react';
import { TEMPLATE_PACKS } from '../templates';
import type { TemplatePack, EventTemplate } from '../templates';
import { getNextFestivalDate } from '../utils/lunarFestivals';
import './TemplateGallery.css';

interface TemplateGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEvent: (event: {
        name: string;
        targetDate: string;
        category: string;
        color: string;
        recurring?: 'none' | 'yearly';
        note?: string;
    }) => void;
}

export function TemplateGallery({ isOpen, onClose, onAddEvent }: TemplateGalleryProps) {
    const [activePack, setActivePack] = useState<TemplatePack | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
    const [dateValue, setDateValue] = useState('');
    const [customName, setCustomName] = useState('');

    if (!isOpen) return null;

    const handleSelectTemplate = (tpl: EventTemplate) => {
        setSelectedTemplate(tpl);
        setCustomName(tpl.name);
        // Auto-fill date for festival templates
        if (tpl.festivalId) {
            const autoDate = getNextFestivalDate(tpl.festivalId);
            if (autoDate) {
                const d = new Date(autoDate);
                // Format for datetime-local input: YYYY-MM-DDTHH:mm
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                setDateValue(`${y}-${m}-${day}T00:00`);
            } else {
                setDateValue('');
            }
        } else {
            setDateValue('');
        }
    };

    const handleConfirm = () => {
        if (!selectedTemplate || !dateValue) return;
        onAddEvent({
            name: customName || selectedTemplate.name,
            targetDate: new Date(dateValue).toISOString(),
            category: selectedTemplate.category,
            color: selectedTemplate.color,
            recurring: selectedTemplate.recurring || 'none',
            note: selectedTemplate.note,
        });
        // Reset and go back to pack list for adding more
        setSelectedTemplate(null);
        setDateValue('');
        setCustomName('');
    };

    const handleBack = () => {
        if (selectedTemplate) {
            setSelectedTemplate(null);
        } else if (activePack) {
            setActivePack(null);
        } else {
            onClose();
        }
    };

    const handleOverlayClose = () => {
        setActivePack(null);
        setSelectedTemplate(null);
        setDateValue('');
        setCustomName('');
        onClose();
    };

    // ---- Date input step ----
    if (selectedTemplate) {
        return (
            <div className="tg-overlay" onClick={handleOverlayClose}>
                <div className="tg-modal" onClick={e => e.stopPropagation()}>
                    <div className="tg-modal__header">
                        <button className="tg-back" onClick={handleBack}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <h2 className="tg-modal__title">设置日期</h2>
                        <button className="tg-close" onClick={handleOverlayClose}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="tg-date-step">
                        <div className="tg-date-preview">
                            <span className="tg-date-preview__icon">{selectedTemplate.icon}</span>
                            <span className="tg-date-preview__name">{customName}</span>
                        </div>

                        <div className="tg-form-group">
                            <label className="tg-label">事件名称</label>
                            <input
                                className="tg-input"
                                type="text"
                                value={customName}
                                onChange={e => setCustomName(e.target.value)}
                                placeholder={selectedTemplate.name}
                            />
                        </div>

                        <div className="tg-form-group">
                            <label className="tg-label">{selectedTemplate.datePlaceholder}</label>
                            {selectedTemplate.festivalId ? (
                                <div className="tg-auto-date">
                                    <span className="tg-auto-date__icon">📅</span>
                                    <span className="tg-auto-date__text">
                                        {dateValue ? new Date(dateValue).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '计算中...'}
                                    </span>
                                    <span className="tg-auto-date__badge">自动计算</span>
                                </div>
                            ) : (
                                <input
                                    className="tg-input"
                                    type="datetime-local"
                                    value={dateValue}
                                    onChange={e => setDateValue(e.target.value)}
                                />
                            )}
                            <p className="tg-hint">
                                {selectedTemplate.festivalId && '🎊 日期已根据农历/公历自动计算，每年会自动更新'}
                                {!selectedTemplate.festivalId && selectedTemplate.dateHint === 'past' && '💡 选择一个过去的日期，App 会显示距今已过多久'}
                                {!selectedTemplate.festivalId && selectedTemplate.dateHint === 'future' && '💡 选择一个未来的日期，App 会倒计时'}
                                {!selectedTemplate.festivalId && selectedTemplate.dateHint === 'recurring' && '💡 选择日期后会自动设为每年循环'}
                            </p>
                        </div>

                        {selectedTemplate.note && (
                            <p className="tg-note">📝 {selectedTemplate.note}</p>
                        )}

                        <button
                            className="tg-confirm-btn"
                            onClick={handleConfirm}
                            disabled={!dateValue}
                        >
                            添加事件
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ---- Template list in a pack ----
    if (activePack) {
        return (
            <div className="tg-overlay" onClick={handleOverlayClose}>
                <div className="tg-modal" onClick={e => e.stopPropagation()}>
                    <div className="tg-modal__header">
                        <button className="tg-back" onClick={handleBack}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <h2 className="tg-modal__title">{activePack.icon} {activePack.name}</h2>
                        <button className="tg-close" onClick={handleOverlayClose}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="tg-template-list">
                        {activePack.templates.map((tpl, i) => (
                            <button
                                key={i}
                                className="tg-template-item"
                                onClick={() => handleSelectTemplate(tpl)}
                            >
                                <span className="tg-template-item__icon">{tpl.icon}</span>
                                <div className="tg-template-item__info">
                                    <span className="tg-template-item__name">{tpl.name}</span>
                                    <span className="tg-template-item__hint">
                                        {tpl.festivalId ? (() => {
                                            const d = getNextFestivalDate(tpl.festivalId!);
                                            if (d) {
                                                const date = new Date(d);
                                                const days = Math.ceil((date.getTime() - Date.now()) / 86400_000);
                                                return days > 0 ? `${days} 天后` : '就是今天！';
                                            }
                                            return '自动计算';
                                        })() : ''}
                                        {!tpl.festivalId && tpl.dateHint === 'past' && '回溯'}
                                        {!tpl.festivalId && tpl.dateHint === 'future' && '展望'}
                                        {!tpl.festivalId && tpl.dateHint === 'recurring' && '每年循环'}
                                        {!tpl.festivalId && tpl.recurring === 'yearly' && tpl.dateHint !== 'recurring' && ' · 每年循环'}
                                    </span>
                                </div>
                                <svg className="tg-template-item__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ---- Pack selection ----
    return (
        <div className="tg-overlay" onClick={handleOverlayClose}>
            <div className="tg-modal" onClick={e => e.stopPropagation()}>
                <div className="tg-modal__header">
                    <h2 className="tg-modal__title">快速添加</h2>
                    <button className="tg-close" onClick={handleOverlayClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <p className="tg-subtitle">选择一个模板包，快速添加常见事件</p>

                <div className="tg-pack-grid">
                    {TEMPLATE_PACKS.map(pack => (
                        <button
                            key={pack.id}
                            className="tg-pack-card"
                            onClick={() => setActivePack(pack)}
                        >
                            <div className="tg-pack-card__accent" style={{ background: pack.gradient }} />
                            <span className="tg-pack-card__icon">{pack.icon}</span>
                            <span className="tg-pack-card__name">{pack.name}</span>
                            <span className="tg-pack-card__desc">{pack.description}</span>
                            <span className="tg-pack-card__count">{pack.templates.length} 个模板</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
