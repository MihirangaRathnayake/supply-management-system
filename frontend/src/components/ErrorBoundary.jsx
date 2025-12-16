import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.state = { hasError: true, error, errorInfo };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                            <p className="text-slate-600 mb-6">An error occurred while loading this page.</p>
                            
                            {this.state.error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                                    <p className="text-sm font-mono text-red-800 mb-2">
                                        <strong>Error:</strong> {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-red-700">
                                            <summary className="cursor-pointer font-semibold mb-2">Stack trace</summary>
                                            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Reload Page
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                                >
                                    Go Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
