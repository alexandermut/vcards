import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
                            <AlertTriangle size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Upps, da ist etwas schiefgelaufen
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            Die App ist auf einen unerwarteten Fehler gestoßen. Wir haben den Fehler protokolliert.
                        </p>

                        {this.state.error && (
                            <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg text-xs font-mono text-left overflow-auto max-h-32 mb-6 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} />
                            App neu laden
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
