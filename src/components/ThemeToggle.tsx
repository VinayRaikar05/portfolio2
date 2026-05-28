/**
 * ThemeToggle - Dark/Light mode switcher
 */
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        // Check for saved theme preference or default to 'dark'
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('light', savedTheme === 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('light', newTheme === 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-white/60" />
            ) : (
                <Moon className="w-4 h-4 text-gray-700" />
            )}
        </button>
    );
}

