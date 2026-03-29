import { useState, useEffect, ReactNode } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
  componentStack?: string;
}

interface GuardianState {
  hasError: boolean;
  error: ErrorInfo | null;
  errorCount: number;
  lastRecoveryAttempt: number | null;
}

const MAX_ERRORS_BEFORE_RESET = 5;
const ERROR_COOLDOWN_MS = 30000;

class GuardianAgent {
  private errors: ErrorInfo[] = [];
  private listeners: Set<(error: ErrorInfo) => void> = new Set();
  private isRecovering = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.onerror = this.handleGlobalError.bind(this);
      window.onunhandledrejection = this.handleUnhandledRejection.bind(this);
    }
  }

  private handleGlobalError(
    message: string | Event,
    source?: string | Event,
    lineno?: number,
    colno?: number,
    error?: Error
  ): boolean {
    const errorInfo: ErrorInfo = {
      message: typeof message === 'string' ? message : 'Unknown error',
      stack: error?.stack,
      timestamp: Date.now(),
    };

    if (typeof source === 'string' && lineno && colno) {
      errorInfo.message += ` (${source}:${lineno}:${colno})`;
    }

    this.logError(errorInfo);
    return true;
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const errorInfo: ErrorInfo = {
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      timestamp: Date.now(),
    };

    this.logError(errorInfo);
  }

  logError(error: ErrorInfo): void {
    this.errors.push(error);
    
    if (this.errors.length > MAX_ERRORS_BEFORE_RESET) {
      this.errors.shift();
    }

    console.error('[Guardian Agent] Error captured:', error);

    this.notifyListeners(error);

    if (this.shouldAutoReset()) {
      this.attemptRecovery();
    }
  }

  private shouldAutoReset(): boolean {
    const recentErrors = this.errors.filter(
      e => Date.now() - e.timestamp < ERROR_COOLDOWN_MS
    );
    return recentErrors.length >= MAX_ERRORS_BEFORE_RESET;
  }

  private attemptRecovery(): void {
    if (this.isRecovering) return;
    this.isRecovering = true;

    console.warn('[Guardian Agent] Attempting automatic recovery...');

    setTimeout(() => {
      this.errors = [];
      this.isRecovering = false;
      console.log('[Guardian Agent] Recovery successful');
    }, 1000);
  }

  subscribe(callback: (error: ErrorInfo) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(error: ErrorInfo): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('[Guardian Agent] Listener error:', e);
      }
    });
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const guardianAgent = new GuardianAgent();

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: ErrorInfo) => void;
  showError?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const errorInfo2: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      componentStack: errorInfo.componentStack,
    };

    guardianAgent.logError(errorInfo2);
    
    if (this.props.onError) {
      this.props.onError(errorInfo2);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && !prevProps.showError) {
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, ERROR_COOLDOWN_MS);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    guardianAgent.clearErrors();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card rounded-2xl border shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Nao se preocupe, nosso Guardian Agent esta protegendo o sistema.
            </p>

            {this.state.error && (
              <details className="text-left bg-muted/50 rounded-lg p-3 mb-6 text-xs">
                <summary className="font-medium cursor-pointer">Detalhes do erro</summary>
                <pre className="mt-2 whitespace-pre-wrap break-all text-destructive/70">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-muted text-muted-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Ir para Inicio
              </button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Guardian Agent ativo - Protegendo seu sistema
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from 'react';

export function withGuardian<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  const WithGuardian: React.FC<P> = (props) => (
    <ErrorBoundary>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithGuardian.displayName = `WithGuardian(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithGuardian;
}

export function useGuardian() {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  useEffect(() => {
    const unsubscribe = guardianAgent.subscribe((error) => {
      setErrors(prev => [...prev.slice(-9), error]);
    });

    return unsubscribe;
  }, []);

  return {
    errors,
    errorCount: guardianAgent.getErrorCount(),
    clearErrors: () => guardianAgent.clearErrors(),
  };
}

export default guardianAgent;
