import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

const THEME_KEY = 'time-matter-theme';

function getInitialTheme(): Theme {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // Respect system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        // Update meta theme color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? '#0a0a14' : '#f0efe8');
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return { theme, toggleTheme };
}
