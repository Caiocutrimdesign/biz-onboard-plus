import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAgentOrchestrator, type AgentState } from '@/agents/orchestrator/useAgentOrchestrator';

interface AgentContextValue {
  agents: Record<string, AgentState>;
  logs: any[];
  stats: {
    totalCustomers: number;
    newToday: number;
    activeCustomers: number;
    pendingSync: number;
  };
  isRunning: boolean;
  startAgents: () => void;
  stopAgents: () => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

interface AgentProviderProps {
  children: ReactNode;
  autoStart?: boolean;
}

export function AgentProvider({ children, autoStart = true }: AgentProviderProps) {
  const orchestrator = useAgentOrchestrator();
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
  const { agents } = useAgents();
  return {
    agent: agents[agentId],
  };
}

export default AgentProvider;