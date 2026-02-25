import { useEffect } from 'react';

interface KeyboardShortcuts {
    onNew: () => void;
    onSearch: () => void;
    onEscape: () => void;
}

export function useKeyboardShortcuts({ onNew, onSearch, onEscape }: KeyboardShortcuts) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore when typing in an input
            const tag = (e.target as HTMLElement).tagName;
            const isInputFocused = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

            if (e.key === 'Escape') {
                onEscape();
                return;
            }

            if (isInputFocused) return;

            // N = new event
            if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                onNew();
                return;
            }

            // / or Cmd+K = focus search
            if (e.key === '/' || (e.metaKey && e.key === 'k')) {
                e.preventDefault();
                onSearch();
                return;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onNew, onSearch, onEscape]);
}
