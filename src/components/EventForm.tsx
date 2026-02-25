import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, REMINDER_PRESETS } from '../types';
import type { TimeEvent, EventCategory, CategoryInfo } from '../types';
import './EventForm.css';

interface EventFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<TimeEvent, 'id' | 'createdAt' | 'order'>) => void;
    onUpdate?: (id: string, updates: Partial<Omit<TimeEvent, 'id' | 'createdAt'>>) => void;
    editingEvent?: TimeEvent | null;
    customCategories?: Record<string, CategoryInfo>;
}

const PRESET_COLORS = [
    '#D4AF37', '#82CAFF', '#f093fb', '#43e97b', '#fa709a',
    '#4facfe', '#a18cd1', '#fee140', '#f5576c', '#38f9d7',
];

export function EventForm({ isOpen, onClose, onSave, onUpdate, editingEvent, customCategories = {} }: EventFormProps) {
    const [name, setName] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [category, setCategory] = useState<EventCategory>('custom');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [recurring, setRecurring] = useState<'none' | 'yearly'>('none');
    const [note, setNote] = useState('');
    const [reminderMinutes, setReminderMinutes] = useState(0);
    const overlayRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Merge built-in + custom categories
    const allCategories = { ...CATEGORIES, ...customCategories };

    useEffect(() => {
        if (editingEvent) {
            setName(editingEvent.name);
            const d = new Date(editingEvent.targetDate);
            const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            setTargetDate(localDate);
            setCategory(editingEvent.category);
            setColor(editingEvent.color);
            setRecurring(editingEvent.recurring || 'none');
            setNote(editingEvent.note || '');
            setReminderMinutes(editingEvent.reminderMinutes || 0);
        } else {
            setName('');
            setTargetDate('');
            setCategory('custom');
            setColor(PRESET_COLORS[0]);
            setRecurring('none');
            setNote('');
            setReminderMinutes(0);
        }
    }, [editingEvent, isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => nameInputRef.current?.focus(), 300);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !targetDate) return;

        const payload = {
            name: name.trim(),
            targetDate: new Date(targetDate).toISOString(),
            category,
            color,
            recurring,
            note: note.trim() || undefined,
            reminderMinutes: reminderMinutes || undefined,
        };

        if (editingEvent && onUpdate) {
            onUpdate(editingEvent.id, payload);
        } else {
            onSave(payload);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="form-overlay"
            ref={overlayRef}
            onClick={handleOverlayClick}
        >
            <div className="form-modal">
                <div className="form-modal__header">
                    <h2 className="form-modal__title">
                        {editingEvent ? '编辑事件' : '新建事件'}
                    </h2>
                    <button className="form-modal__close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="form-modal__body">
                    <div className="form-group">
                        <label className="form-label">事件名称</label>
                        <input
                            ref={nameInputRef}
                            className="form-input"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="例如：30 岁生日"
                            maxLength={50}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">目标日期与时间</label>
                        <input
                            className="form-input"
                            type="datetime-local"
                            value={targetDate}
                            onChange={e => setTargetDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">分类</label>
                        <div className="form-categories">
                            {(Object.entries(allCategories) as [string, CategoryInfo][]).map(([key, cat]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`form-category-btn ${category === key ? 'active' : ''}`}
                                    onClick={() => setCategory(key)}
                                >
                                    <span className="form-category-icon">{cat.icon}</span>
                                    <span className="form-category-name">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">颜色</label>
                        <div className="form-colors">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`form-color-btn ${color === c ? 'active' : ''}`}
                                    style={{ '--swatch': c } as React.CSSProperties}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group form-group--half">
                            <label className="form-label">周期</label>
                            <div className="form-toggle-row">
                                <button
                                    type="button"
                                    className={`form-toggle-btn ${recurring === 'none' ? 'active' : ''}`}
                                    onClick={() => setRecurring('none')}
                                >一次性</button>
                                <button
                                    type="button"
                                    className={`form-toggle-btn ${recurring === 'yearly' ? 'active' : ''}`}
                                    onClick={() => setRecurring('yearly')}
                                >🔁 每年</button>
                            </div>
                        </div>

                        <div className="form-group form-group--half">
                            <label className="form-label">⏰ 提醒</label>
                            <select
                                className="form-input form-select"
                                value={reminderMinutes}
                                onChange={e => setReminderMinutes(Number(e.target.value))}
                            >
                                {REMINDER_PRESETS.map(p => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">备注 (可选)</label>
                        <textarea
                            className="form-input form-textarea"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="添加一些备注信息..."
                            rows={2}
                            maxLength={200}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="form-btn form-btn--secondary" onClick={onClose}>
                            取消
                        </button>
                        <button type="submit" className="form-btn form-btn--primary" disabled={!name.trim() || !targetDate}>
                            {editingEvent ? '保存修改' : '创建事件'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
