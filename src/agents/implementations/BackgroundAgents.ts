import { crmService } from '@/lib/crmService';

export interface AgentMetrics {
  tasksCompleted: number;
  errorsCount: number;
  lastRun: string | null;
  uptime: string;
  status: 'active' | 'paused' | 'error';
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'ai' | 'integration' | 'security';
  checkInterval: number;
  enabled: boolean;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected metrics: AgentMetrics;
  protected intervalId: ReturnType<typeof setInterval> | null = null;
  protected isRunning: boolean = false;

  constructor(config: AgentConfig) {
    this.config = config;
    this.metrics = {
      tasksCompleted: 0,
      errorsCount: 0,
      lastRun: null,
      uptime: '100%',
      status: 'paused',
    };
  }

  abstract execute(): Promise<void>;

  async run(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.metrics.status = 'active';
    
    try {
      await this.execute();
      this.metrics.tasksCompleted++;
      this.metrics.lastRun = new Date().toISOString();
    } catch (error) {
      this.metrics.errorsCount++;
      console.error(`[${this.config.name}] Error:`, error);
    } finally {
      this.isRunning = false;
    }
  }

  start(): void {
    if (this.intervalId) return;
    
    this.run();
    this.intervalId = setInterval(() => {
      this.run();
    }, this.config.checkInterval);
    
    this.metrics.status = 'active';
    console.log(`🤖 [${this.config.name}] Started`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.metrics.status = 'paused';
    console.log(`⏸️ [${this.config.name}] Stopped`);
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }
}

export class CRMMetricsAgent extends BaseAgent {
  private customerStats = { total: 0, active: 0, pending: 0 };

  constructor() {
    super({
      id: 'crm-metrics-agent',
      name: 'CRM Metrics Agent',
      description: 'Coleta métricas do CRM e atualiza dashboard',
      category: 'core',
      checkInterval: 60000,
      enabled: true,
    });
  }

  async execute(): Promise<void> {
    const customers = await crmService.getClientes();
    const stats = {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      pending: customers.filter(c => c.status === 'pending' || c.status === 'novo_cadastro').length,
    };

    this.customerStats = stats;
    
    localStorage.setItem('crm_metrics', JSON.stringify({
      ...stats,
      timestamp: new Date().toISOString(),
    }));
    
    console.log('📊 CRM Metrics updated:', stats);
  }

  getStats() {
    return this.customerStats;
  }
}

export class TECHealthAgent extends BaseAgent {
  constructor() {
    super({
      id: 'tec-health-agent',
      name: 'TEC Health Agent',
      description: 'Monitora saúde dos serviços técnicos',
      category: 'core',
      checkInterval: 30000,
      enabled: true,
    });
  }

  async execute(): Promise<void> {
    const services = await crmService.getServicos();
    
    const health = {
      total: services.length,
      pending: services.filter(s => s.status === 'pendente').length,
      inProgress: services.filter(s => s.status === 'em_andamento').length,
      completed: services.filter(s => s.status === 'concluido').length,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('tec_health', JSON.stringify(health));
    console.log('🔧 TEC Health:', health);
  }
}

export class SystemHealthAgent extends BaseAgent {
  constructor() {
    super({
      id: 'system-health-agent',
      name: 'System Health Agent',
      description: 'Monitora saúde geral do sistema',
      category: 'security',
      checkInterval: 15000,
      enabled: true,
    });
  }

  async execute(): Promise<void> {
    const health = {
      memory: this.getMemoryUsage(),
      localStorage: this.getLocalStorageUsage(),
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('system_health', JSON.stringify(health));
    
    if (health.memory > 90) {
      console.warn('⚠️ High memory usage detected');
    }
    
    console.log('💚 System Health:', health);
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100);
    }
    return 0;
  }

  private getLocalStorageUsage(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    return Math.round(total / 1024);
  }
}

const crmMetricsAgent = new CRMMetricsAgent();
const tecHealthAgent = new TECHealthAgent();
const systemHealthAgent = new SystemHealthAgent();

export const backgroundAgents = {
  crmMetrics: crmMetricsAgent,
  tecHealth: tecHealthAgent,
  systemHealth: systemHealthAgent,
  
  startAll(): void {
    this.crmMetrics.start();
    this.tecHealth.start();
    this.systemHealth.start();
  },
  
  stopAll(): void {
    this.crmMetrics.stop();
    this.tecHealth.stop();
    this.systemHealth.stop();
  },
  
  getAllMetrics(): Record<string, AgentMetrics> {
    return {
      crmMetrics: this.crmMetrics.getMetrics(),
      tecHealth: this.tecHealth.getMetrics(),
      systemHealth: this.systemHealth.getMetrics(),
    };
  },
};

export default backgroundAgents;
