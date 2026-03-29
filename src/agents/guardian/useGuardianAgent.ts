import { useCallback, useEffect, useRef, useState } from 'react';

interface GuardianConfig {
  maxRetries: number;
  timeout: number;
  enableAutoRecovery: boolean;
  enableFallback: boolean;
  logErrors: boolean;
  onError?: (error: Error, context: string) => void;
  onRecovery?: (context: string) => void;
}

const DEFAULT_CONFIG: GuardianConfig = {
  maxRetries: 3,
  timeout: 10000,
  enableAutoRecovery: true,
  enableFallback: true,
  logErrors: true,
};

interface ErrorLog {
  id: string;
  error: string;
  context: string;
  timestamp: Date;
  resolved: boolean;
  stack?: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  errors: number;
  recoveries: number;
  lastCheck: Date;
  uptime: number;
}

export function useGuardianAgent(config: GuardianConfig = DEFAULT_CONFIG) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'healthy',
    errors: 0,
    recoveries: 0,
    lastCheck: new Date(),
    uptime: 100,
  });
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  
  const startTimeRef = useRef(Date.now());
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const logError = useCallback((error: Error, context: string) => {
    if (!configRef.current.logErrors) return;

    const errorLog: ErrorLog = {
      id: `err-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      error: error.message || String(error),
      context,
      timestamp: new Date(),
      resolved: false,
      stack: error.stack,
    };

    setErrorLogs(prev => [errorLog, ...prev].slice(0, 100));
    setHealthStatus(prev => ({
      ...prev,
      errors: prev.errors + 1,
    }));

    configRef.current.onError?.(error, context);
  }, []);

  const resolveError = useCallback((errorId: string) => {
    setErrorLogs(prev => 
      prev.map(log => log.id === errorId ? { ...log, resolved: true } : log)
    );
  }, []);

  const withProtection = useCallback(<T,>(
    fn: () => T,
    context: string,
    fallback?: () => T
  ): T => {
    try {
      return fn();
    } catch (error) {
      logError(error as Error, context);
      
      if (configRef.current.enableFallback && fallback) {
        try {
          return fallback();
        } catch (fallbackError) {
          logError(fallbackError as Error, `${context}-fallback`);
        }
      }
      
      return undefined as T;
    }
  }, [logError]);

  const withAsyncProtection = useCallback(async <T,>(
    fn: () => Promise<T>,
    context: string,
    fallback?: () => T,
    retries: number = configRef.current.maxRetries
  ): Promise<T | null> => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await Promise.race([
          fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), configRef.current.timeout)
          ),
        ]);
        return result as T;
      } catch (error) {
        lastError = error as Error;
        logError(lastError, `${context} (attempt ${attempt}/${retries})`);
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    if (configRef.current.enableFallback && fallback) {
      try {
        const fallbackResult = fallback();
        setHealthStatus(prev => ({ ...prev, recoveries: prev.recoveries + 1 }));
        configRef.current.onRecovery?.(context);
        return fallbackResult;
      } catch (fallbackError) {
        logError(fallbackError as Error, `${context}-fallback-failed`);
      }
    }
    
    return null;
  }, [logError]);

  const safeSetState = useCallback(<S,>(setter: React.Dispatch<React.SetStateAction<S>>, value: S) => {
    try {
      setter(value);
      return true;
    } catch (error) {
      logError(error as Error, 'safeSetState');
      return false;
    }
  }, [logError]);

  const safeLocalStorage = useCallback({
    get: <T,>(key: string, defaultValue: T): T => {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
      } catch (error) {
        logError(error as Error, `localStorage.get:${key}`);
        return defaultValue;
      }
    },
    
    set: (key: string, value: any): boolean => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        logError(error as Error, `localStorage.set:${key}`);
        try {
          const simplified = typeof value === 'object' ? { ...value, _simplified: true } : value;
          localStorage.setItem(key, JSON.stringify(simplified));
          return true;
        } catch {
          return false;
        }
      }
    },
    
    remove: (key: string): boolean => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        logError(error as Error, `localStorage.remove:${key}`);
        return false;
      }
    },
  }, [logError]);

  const safeFetch = useCallback(async (
    url: string,
    options?: RequestInit,
    fallback?: () => Promise<any>
  ): Promise<any | null> => {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout?.(configRef.current.timeout) || undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logError(error as Error, `fetch:${url}`);
      
      if (fallback) {
        try {
          const fallbackResult = await fallback();
          setHealthStatus(prev => ({ ...prev, recoveries: prev.recoveries + 1 }));
          configRef.current.onRecovery?.(`fetch:${url}`);
          return fallbackResult;
        } catch (fallbackError) {
          logError(fallbackError as Error, `fetch:${url}-fallback`);
        }
      }
      
      return null;
    }
  }, [logError]);

  const withCircuitBreaker = useCallback(<T,>(
    fn: () => T,
    context: string,
    fallback: () => T,
    failureThreshold: number = 5,
    resetTimeout: number = 60000
  ): T => {
    const circuitKey = `circuit_${context}`;
    const state = safeLocalStorage.get<{
      failures: number;
      lastFailure: number;
      isOpen: boolean;
    }>(circuitKey, { failures: 0, lastFailure: 0, isOpen: false });

    if (state.isOpen) {
      const timeSinceFailure = Date.now() - state.lastFailure;
      if (timeSinceFailure < resetTimeout) {
        return fallback();
      }
      safeLocalStorage.set(circuitKey, { ...state, isOpen: false, failures: 0 });
    }

    try {
      const result = fn();
      safeLocalStorage.set(circuitKey, { failures: 0, lastFailure: 0, isOpen: false });
      return result;
    } catch (error) {
      const newFailures = state.failures + 1;
      const isOpen = newFailures >= failureThreshold;
      
      safeLocalStorage.set(circuitKey, {
        failures: newFailures,
        lastFailure: Date.now(),
        isOpen,
      });

      logError(error as Error, `${context} (circuit breaker: ${newFailures}/${failureThreshold})`);

      if (isOpen) {
        setTimeout(() => {
          safeLocalStorage.set(circuitKey, { failures: 0, lastFailure: 0, isOpen: false });
        }, resetTimeout);
      }

      return fallback();
    }
  }, [safeLocalStorage, logError]);

  const checkHealth = useCallback(() => {
    const checks = {
      localStorage: (() => {
        try {
          localStorage.setItem('health_check', 'ok');
          localStorage.removeItem('health_check');
          return true;
        } catch {
          return false;
        }
      })(),
      memory: (() => {
        if ((performance as any).memory) {
          const mem = (performance as any).memory;
          return mem.usedJSHeapSize < mem.jsHeapSizeLimit * 0.9;
        }
        return true;
      })(),
      errors: errorLogs.filter(e => !e.resolved).length < 10,
    };

    const isHealthy = checks.localStorage && checks.memory && checks.errors;
    const isDegraded = !checks.localStorage || !checks.memory;

    setHealthStatus(prev => ({
      ...prev,
      status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'critical',
      lastCheck: new Date(),
      uptime: Math.round(((Date.now() - startTimeRef.current) / Date.now()) * 100 * 100) / 100,
    }));

    return checks;
  }, [errorLogs]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(checkHealth, 30000);
    checkHealth();

    const errorHandler = (event: ErrorEvent) => {
      logError(new Error(event.message), `window.onerror:${event.filename}:${event.lineno}`);
    };

    const unhandledHandler = (event: PromiseRejectionEvent) => {
      logError(new Error(String(event.reason)), 'unhandledPromiseRejection');
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledHandler);
    };
  }, [isMonitoring, checkHealth, logError]);

  return {
    healthStatus,
    errorLogs,
    isMonitoring,
    setIsMonitoring,
    logError,
    resolveError,
    withProtection,
    withAsyncProtection,
    withCircuitBreaker,
    safeSetState,
    safeLocalStorage,
    safeFetch,
    checkHealth,
    clearErrorLogs: () => setErrorLogs([]),
    getStatus: () => ({
      ...healthStatus,
      unresolvedErrors: errorLogs.filter(e => !e.resolved).length,
      recentErrors: errorLogs.slice(0, 5),
    }),
  };
}

export type { GuardianConfig, ErrorLog, HealthStatus };
