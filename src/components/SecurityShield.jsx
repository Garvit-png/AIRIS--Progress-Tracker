import React, { useEffect } from 'react';

/**
 * SecurityShield Component
 * Implements runtime protections against source code inspection.
 * - Disables Right-Click
 * - Disables Keyboard Shortcuts (F12, Ctrl+Shift+I, etc.)
 * - Anti-Debugger Loop
 */
export default function SecurityShield({ children }) {
    useEffect(() => {
        // Only apply in production or if explicitly enabled
        // if (process.env.NODE_ENV !== 'production') return;

        // 1. Disable Right-Click
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // 2. Disable Key Shortcuts
        const handleKeyDown = (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+I / J / C / U
            if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.keyCode === 85)) {
                e.preventDefault();
                return false;
            }
            // Cmd+Opt+I / J (Mac)
            if (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) {
                e.preventDefault();
                return false;
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
        };

        // 3. Anti-Debugger Loop
        // This makes the browser pause if DevTools is open
        const interval = setInterval(() => {
            const before = new Date().getTime();
            debugger;
            const after = new Date().getTime();
            if (after - before > 100) {
                // If it took longer than 100ms, a debugger (DevTools) is likely active
                console.log('%c ACCESS DENIED ', 'background: #FF0D99; color: white; font-size: 50px; font-weight: bold;');
            }
        }, 1000);

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            clearInterval(interval);
        };
    }, []);

    return <>{children}</>;
}
