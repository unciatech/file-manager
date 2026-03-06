'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertCircleIcon, RefreshCwIcon } from './icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React component errors gracefully.
 * Provides a fallback UI when an error occurs instead of crashing the entire app.
 */
export class FileManagerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error('FileManager Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    // A hard reload is the safest way to clear corrupted React state
    // for an application-level failure boundary.
    globalThis.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI or use provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8 w-full h-full bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <div className="text-center max-w-md flex flex-col items-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <AlertCircleIcon className="size-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              The file manager encountered an unexpected error. Refreshing the page usually resolves this issue.
            </p>
            {this.state.error && (
              <details className="mb-6 text-left w-full border border-slate-200 rounded-lg overflow-hidden flex-col group">
                <summary className="cursor-pointer text-xs font-mono bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors">
                  View Technical Details
                </summary>
                <div className="p-3 bg-white dark:bg-zinc-900">
                  <pre className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap word-break-all max-h-40 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </div>
              </details>
            )}
            <Button onClick={this.handleReset} radius="full" className="gap-2">
              <RefreshCwIcon className="size-4" />
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
