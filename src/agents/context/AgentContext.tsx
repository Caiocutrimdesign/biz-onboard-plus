import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAgentOrchestrator, type AgentState, type AgentLog, type OrchestratorConfig } from '@/agents/orchestrator/useAgentOrchestrator';

interface AgentContextValue {
  agents: Record<string, AgentState>;
  logs: AgentLog[];
  stats: {
    totalCustomers: number;
    newToday: number;
    activeCustomers: number;
    pendingSync: number;
    systemHealth: 'healthy' | 'degraded' | 'critical';
  };
  isRunning: boolean;
  startAgents: () => void;
  stopAgents: () => void;
  restartAgent: (agentId: string) => void;
  updateConfig: (config: Partial<OrchestratorConfig>) => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

interface AgentProviderProps {
  children: ReactNode;
  config?: OrchestratorConfig;
  autoStart?: boolean;
}

export function AgentProvider({ children, config, autoStart = true }: AgentProviderProps) {
  const orchestrator = useAgentOrchestrator(config);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (autoStart && !initialized) {
      setInitialized(true);
    }
  }, [autoStart, initialized]);

  const value: AgentContextValue = {
    agents: orchestrator.agents,
    logs: orchestrator.logs,
    stats: orchestrator.stats,
    isRunning: orchestrator.isRunning,
    startAgents: orchestrator.startAgents,
    stopAgents: orchestrator.stopAgents,
    restartAgent: orchestrator.restartAgent,
    updateConfig: orchestrator.updateConfig,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
}

export function useAgent(agentId: string) {
  const { agents, restartAgent } = useAgents();
  return {
    agent: agents[agentId],
    restart: () => restartAgent(agentId),
  };
}

export default AgentProvider;
