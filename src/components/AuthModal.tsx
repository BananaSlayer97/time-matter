import { useState } from 'react';
import './AuthModal.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignIn: (email: string, password: string) => Promise<void>;
    onSignUp: (email: string, password: string) => Promise<void>;
    onGithub: () => Promise<void>;
}

export function AuthModal({ isOpen, onClose, onSignIn, onSignUp, onGithub }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await onSignIn(email, password);
                onClose();
            } else {
                await onSignUp(email, password);
                setSuccess('注册成功！请查收验证邮件。');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '操作失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <button className="auth-modal__close" onClick={onClose}>×</button>

                <div className="auth-modal__header">
                    <h2 className="auth-modal__title">
                        {mode === 'login' ? '登录' : '注册'}
                    </h2>
                    <p className="auth-modal__subtitle">
                        {mode === 'login' ? '登录后数据将自动同步到云端' : '创建账号开始云同步'}
                    </p>
                </div>

                <form className="auth-modal__form" onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="邮箱地址"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="密码 (至少6位)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />

                    {error && <p className="auth-error">{error}</p>}
                    {success && <p className="auth-success">{success}</p>}

                    <button className="auth-btn auth-btn--primary" type="submit" disabled={loading}>
                        {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>或</span>
                </div>

                <button className="auth-btn auth-btn--github" onClick={onGithub} disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub 登录
                </button>

                <p className="auth-toggle">
                    {mode === 'login' ? (
                        <>还没有账号？<button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>注册</button></>
                    ) : (
                        <>已有账号？<button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>登录</button></>
                    )}
                </p>
            </div>
        </div>
    );
}
