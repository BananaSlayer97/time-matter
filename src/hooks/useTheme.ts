import { useState, useEffect, useCallback } from 'react';

export type Theme = 'midnight' | 'twilight' | 'dawn' | 'frost';

export const THEME_OPTIONS: { id: Theme; label: string; icon: string; desc: string }[] = [
    { id: 'midnight', label: '午夜', icon: '🌑', desc: '深邃暗色' },
    { id: 'twilight', label: '暮光', icon: '🌙', desc: '柔和暗色' },
    { id: 'dawn', label: '晨曦', icon: '🌅', desc: '暖调亮色' },
    { id: 'frost', label: '霜白', icon: '❄️', desc: '清爽亮色' },
];

const THEME_KEY = 'time-matter-theme';

const META_COLORS: Record<Theme, string> = {
    midnight: '#10101e',
    twilight: '#1a1d28',
    dawn: '#f5f3ef',
    frost: '#f0f2f5',
};

function isValidTheme(v: string): v is Theme {
    return ['midnight', 'twilight', 'dawn', 'frost'].includes(v);
}

function getInitialTheme(): Theme {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && isValidTheme(saved)) return saved;
    // Migrate old values
    if (saved === 'dark') return 'midnight';
    if (saved === 'light') return 'dawn';
    // Respect system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'dawn';
    return 'midnight';
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', META_COLORS[theme]);
        }
    }, [theme]);

    const setThemeById = useCallback((t: Theme) => {
        setTheme(t);
    }, []);

    // Keep toggleTheme for backward compat (cycles through themes)
    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const order: Theme[] = ['midnight', 'twilight', 'dawn', 'frost'];
            const idx = order.indexOf(prev);
            return order[(idx + 1) % order.length];
        });
    }, []);

    return { theme, setTheme: setThemeById, toggleTheme };
}
