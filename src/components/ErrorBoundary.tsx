import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: 'var(--text-primary)',
                    fontFamily: "'DM Sans', sans-serif",
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '24px',
                        marginBottom: '8px',
                    }}>
                        出了点问题
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        marginBottom: '24px',
                        maxWidth: '360px',
                    }}>
                        {this.state.error?.message || '应用遇到了未知错误'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '12px 28px',
                            background: 'var(--accent-gold)',
                            color: '#1a1a2e',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        重试
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
