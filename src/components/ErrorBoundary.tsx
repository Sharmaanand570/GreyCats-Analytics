import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Check for dynamic import errors (version mismatch)
        if (
            error.message.includes("Failed to fetch dynamically imported module") ||
            error.message.includes("Loading chunk") ||
            error.message.includes("Importing a module script failed")
        ) {
            const storageKey = 'chunk_load_error_reload';
            const lastReload = sessionStorage.getItem(storageKey);
            const now = Date.now();

            // Only reload if we haven't done so in the last 10 seconds to prevent loops
            if (!lastReload || (now - parseInt(lastReload)) > 10000) {
                sessionStorage.setItem(storageKey, now.toString());
                window.location.reload();
            }
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gray-50 p-4 text-center">
                    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-200">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error properly loading this page.
                            Please try refreshing the page.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="text-left bg-gray-100 p-4 rounded overflow-auto text-xs text-red-800 mb-6 max-h-40">
                                {this.state.error.toString()}
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
