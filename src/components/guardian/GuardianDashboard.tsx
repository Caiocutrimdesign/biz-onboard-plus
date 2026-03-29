import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { guardianAgent, useGuardian, type ErrorInfo } from '@/lib/guardianAgent';

export default function GuardianDashboard() {
  const { errors, errorCount, clearErrors } = useGuardian();
  const [expanded, setExpanded] = useState(false);
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    setIsHealthy(errorCount === 0);
  }, [errorCount]);

  const handleRetry = () => {
    clearErrors();
    setIsHealthy(true);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {expanded ? (
        <Card className="w-96 shadow-2xl border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-bounce'}`} />
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Guardian Agent
                </CardTitle>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={handleRetry} title="Recarregar">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={clearErrors} title="Limpar erros">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setExpanded(false)}>
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isHealthy ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Sistema Protegido</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">{errorCount} erro(s) detectado(s)</span>
              </div>
            )}

            {errors.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-xs font-medium text-muted-foreground">Erros Recentes:</p>
                {errors.slice().reverse().map((error, index) => (
                  <ErrorItem key={index} error={error} />
                ))}
              </div>
            )}

            {errors.length === 0 && isHealthy && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum erro detectado. Sistema operando normalmente.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 ${
            isHealthy 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600 animate-bounce'
          }`}
          title="Guardian Agent - Clique para ver detalhes"
        >
          <Shield className="w-7 h-7 text-white" />
          {errorCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {errorCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

function ErrorItem({ error }: { error: ErrorInfo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-muted/50 rounded-lg p-2 text-xs">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="truncate flex-1 text-destructive/80">
          {error.message}
        </span>
        <span className="text-muted-foreground ml-2">
          {new Date(error.timestamp).toLocaleTimeString('pt-BR')}
        </span>
      </div>
      {expanded && error.stack && (
        <pre className="mt-2 text-muted-foreground whitespace-pre-wrap break-all bg-background p-2 rounded border mt-1">
          {error.stack}
        </pre>
      )}
    </div>
  );
}
