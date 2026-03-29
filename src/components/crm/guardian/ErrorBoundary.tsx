import { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    try {
      const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errorLogs.push({
        id: `err-${Date.now()}`,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      localStorage.setItem('error_logs', JSON.stringify(errorLogs.slice(-50)));
    } catch (e) {
      console.error('Erro ao salvar log:', e);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center"
            >
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ops! Algo deu errado
            </h1>
            
            <p className="text-gray-600 mb-6">
              Não se preocupe! Nosso sistema de proteção detectou o problema e está trabalhando para corrigi-lo.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-left">
                <p className="text-sm font-medium text-red-800 mb-1">Erro:</p>
                <p className="text-xs text-red-600 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="bg-gradient-brand"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir para Início
              </Button>
            </div>

            <p className="mt-6 text-xs text-gray-400">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}