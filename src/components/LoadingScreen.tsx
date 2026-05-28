/**
 * LoadingScreen - Initial loading state with progress indicator
 */
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
    onLoadComplete: () => void;
}

export default function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onLoadComplete, 300);
                    return 100;
                }
                return prev + 10;
            });
        }, 150);

        return () => clearInterval(interval);
    }, [onLoadComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-void flex items-center justify-center transition-opacity duration-500 ${progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            <div className="text-center">
                {/* Logo or Brand */}
                <div className="mb-8">
                    <h1 className="text-4xl font-light gradient-text">VR</h1>
                </div>

                {/* Progress Bar */}
                <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Loading Text */}
                <p className="mt-4 text-xs text-white/65 tracking-wider">
                    Loading Experience...
                </p>
            </div>
        </div>
    );
}

