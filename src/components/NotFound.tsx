/**
 * NotFound - Custom 404 page
 */
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-void relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/5" />

            {/* Grain overlay */}
            <div className="grain-overlay" />

            <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                {/* 404 Number */}
                <h1 className="text-9xl sm:text-[12rem] font-light text-white/10 mb-4 leading-none">
                    404
                </h1>

                {/* Message */}
                <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
                    Page Not Found
                </h2>

                <p className="text-lg text-white/60 mb-12 font-light">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={handleGoHome}
                        className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </button>

                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}

