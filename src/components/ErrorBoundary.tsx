/**
 * ErrorBoundary - Catch and handle React errors gracefully
 */
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // You can log to error reporting service here (e.g., Sentry)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-void relative overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-red-500/5" />

                    {/* Grain overlay */}
                    <div className="grain-overlay" />

                    <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                        {/* Error Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-red-400/60" />
                            </div>
                        </div>

                        {/* Message */}
                        <h1 className="text-4xl sm:text-5xl font-light text-white mb-4">
                            Something Went Wrong
                        </h1>

                        <p className="text-lg text-white/60 mb-8 font-light">
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </p>

                        {/* Error Details (Development only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-8 p-4 rounded-lg bg-red-500/5 border border-red-500/10 text-left">
                                <p className="text-xs text-red-400/60 font-mono">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={this.handleReset}
                                className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
                            >
                                <Home className="w-4 h-4" />
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

