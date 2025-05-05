
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Send to error monitoring service
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4 bg-red-50 border border-red-100 rounded-lg">
          <h2 className="text-lg font-medium text-red-600 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-500 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.handleReset}>Try Again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Update the global Window interface to match the declaration in errorMonitoring.ts
declare global {
  interface Window {
    Sentry?: {
      init: (config: any) => void;
      captureException: (error: Error) => void;
      setUser: (user: any) => void;
      setContext: (name: string, context: Record<string, any>) => void;
      BrowserTracing: any;
      Replay: any;
    };
  }
}

export default ErrorBoundary;
