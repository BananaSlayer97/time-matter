import { useState, useCallback, useRef } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'undo';
    duration?: number;
    onUndo?: () => void;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timerMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        const timer = timerMap.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timerMap.current.delete(id);
        }
    }, []);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newToast: Toast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);

        const duration = toast.duration ?? (toast.type === 'undo' ? 5000 : 3000);
        const timer = setTimeout(() => {
            removeToast(id);
        }, duration);
        timerMap.current.set(id, timer);

        return id;
    }, [removeToast]);

    const showSuccess = useCallback((message: string) => {
        return addToast({ message, type: 'success' });
    }, [addToast]);

    const showError = useCallback((message: string) => {
        return addToast({ message, type: 'error', duration: 4000 });
    }, [addToast]);

    const showInfo = useCallback((message: string) => {
        return addToast({ message, type: 'info' });
    }, [addToast]);

    const showUndo = useCallback((message: string, onUndo: () => void) => {
        return addToast({ message, type: 'undo', onUndo, duration: 5000 });
    }, [addToast]);

    return { toasts, addToast, removeToast, showSuccess, showError, showInfo, showUndo };
}
