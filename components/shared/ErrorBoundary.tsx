'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card bg-base-200 shadow-xl border border-error max-w-lg w-full">
            <div className="card-body items-center text-center">
              <AlertTriangle className="h-16 w-16 text-error mb-4" />
              <h2 className="card-title text-2xl text-error">Something went wrong</h2>
              <p className="text-base-content/70 mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {this.state.error && (
                <div className="mockup-code w-full text-left mb-4">
                  <pre data-prefix=">" className="text-error text-xs">
                    <code>{this.state.error.message}</code>
                  </pre>
                </div>
              )}
              <div className="card-actions">
                <button 
                  onClick={this.handleReset} 
                  className="btn btn-primary"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn btn-ghost"
                >
                  Refresh Page
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
