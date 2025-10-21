/*
 * ErrorBoundary: Catches React errors and displays a fallback UI
 * 
 * Prevents the entire app from crashing due to component errors
 * Provides user-friendly error messages and recovery options
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback or default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-800 rounded-lg border-2 border-red-500 p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-3xl">
                ⚠️
              </div>
              <div>
                <h1 className="text-3xl font-bold text-red-400">Something went wrong</h1>
                <p className="text-slate-400 mt-1">The game encountered an unexpected error</p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-slate-900 rounded p-4 mb-6 border border-slate-700">
                <p className="text-red-300 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="text-slate-400 text-xs cursor-pointer hover:text-slate-300">
                      Show stack trace
                    </summary>
                    <pre className="text-xs text-slate-500 mt-2 overflow-auto max-h-64">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg 
                         transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 
                         focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg 
                         transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 
                         focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
              >
                Reload Game
              </button>
            </div>

            <p className="text-slate-500 text-sm mt-6">
              If this problem persists, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
