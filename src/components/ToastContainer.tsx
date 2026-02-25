import type { Toast } from '../hooks/useToast';
import './ToastContainer.css';

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" role="alert" aria-live="polite">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast--${toast.type}`}
                >
                    <div className="toast__icon">
                        {toast.type === 'success' && '✓'}
                        {toast.type === 'error' && '✕'}
                        {toast.type === 'info' && 'ℹ'}
                        {toast.type === 'undo' && '↩'}
                    </div>
                    <span className="toast__message">{toast.message}</span>
                    {toast.type === 'undo' && toast.onUndo && (
                        <button
                            className="toast__undo-btn"
                            onClick={() => {
                                toast.onUndo?.();
                                onDismiss(toast.id);
                            }}
                        >
                            撤销
                        </button>
                    )}
                    <button
                        className="toast__close"
                        onClick={() => onDismiss(toast.id)}
                        aria-label="关闭"
                    >
                        ×
                    </button>
                    {/* Auto-dismiss progress bar */}
                    <div
                        className="toast__progress"
                        style={{
                            animationDuration: `${toast.type === 'undo' ? 5 : toast.type === 'error' ? 4 : 3}s`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
