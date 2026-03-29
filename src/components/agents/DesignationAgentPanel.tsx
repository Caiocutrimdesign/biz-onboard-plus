import { useState, useEffect } from 'react';
import { Wrench, Play, Pause, RefreshCw, Clock, CheckCircle2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { designationAgent } from '@/lib/designationAgent';

export default function DesignationAgentPanel() {
  const [agent, setAgent] = useState(designationAgent.getAgent());
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLogs(designationAgent.getLogs());
    
    const interval = setInterval(() => {
      setAgent(designationAgent.getAgent());
      setLogs(designationAgent.getLogs());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (agent.status === 'active') {
      designationAgent.stop();
    } else {
      designationAgent.start();
    }
    setAgent(designationAgent.getAgent());
  };

  const handleRunNow = async () => {
    setLoading(true);
    const results = await designationAgent.run();
    console.log('Resultados da execução:', results);
    setAgent(designationAgent.getAgent());
    setLogs(designationAgent.getLogs());
    setLoading(false);
  };

  const isRunning = agent.status === 'active';

  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isRunning ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Agente de Designação</h3>
              <p className="text-xs text-muted-foreground font-normal">
                Designação automática de técnicos 24h
              </p>
            </div>
          </div>
          <Badge className={isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
            {isRunning ? '🟢 Ativo' : '⏸️ Pausado'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{agent.totalDesignations}</p>
            <p className="text-xs text-muted-foreground">Designações</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              {agent.config.minIntervalSeconds / 60}m
            </p>
            <p className="text-xs text-muted-foreground">Intervalo</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-sm font-bold truncate">
              {agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString('pt-BR') : 'Nunca'}
            </p>
            <p className="text-xs text-muted-foreground">Última execução</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleToggle} 
            className={`flex-1 ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRunNow}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Executar Agora
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>ℹ️ Como funciona:</strong><br/>
            Este agente verifica automaticamente clientes pendentes sem técnico designado e atribui ao técnico com menor carga de trabalho. Roda a cada 5 minutos quando ativo.
          </p>
        </div>

        {logs.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-3 py-2 font-medium text-sm">
              Últimas Designações
            </div>
            <div className="max-h-40 overflow-y-auto">
              {logs.slice(0, 5).map((log, i) => (
                <div key={i} className="px-3 py-2 border-b last:border-0 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{log.technicianName}</span>
                    <span className="text-muted-foreground">←</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{log.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
