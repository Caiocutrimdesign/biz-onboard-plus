import { tecService } from '@/lib/tecService';
import { customerService } from './customerService';
import type { Technician } from '@/types/tec';
import type { CustomerRegistration } from '@/types/customer';

interface DesignationResult {
  success: boolean;
  customerId: string;
  technicianId: string;
  technicianName: string;
  reason: string;
  timestamp: string;
}

interface DesignationAgent {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string | null;
  totalDesignations: number;
  config: {
    autoAssign: boolean;
    minIntervalSeconds: number;
    priorityRules: string[];
  };
}

const AGENT_KEY = 'tec_designation_agent';
const DESIGNATION_LOG_KEY = 'tec_designation_log';

class DesignationAgentSystem {
  private agent: DesignationAgent;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.agent = this.loadAgent();
  }

  private loadAgent(): DesignationAgent {
    const stored = localStorage.getItem(AGENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      id: `agent_designation_${Date.now()}`,
      name: 'Agente de Designação',
      status: 'paused',
      lastRun: null,
      totalDesignations: 0,
      config: {
        autoAssign: true,
        minIntervalSeconds: 300,
        priorityRules: ['least_services', 'availability', 'region'],
      },
    };
  }

  private saveAgent(): void {
    localStorage.setItem(AGENT_KEY, JSON.stringify(this.agent));
  }

  private logDesignation(result: DesignationResult): void {
    const logs = JSON.parse(localStorage.getItem(DESIGNATION_LOG_KEY) || '[]');
    logs.unshift(result);
    localStorage.setItem(DESIGNATION_LOG_KEY, JSON.stringify(logs.slice(0, 500)));
  }

  async getAvailableTechnicians(): Promise<Technician[]> {
    try {
      const technicians = await tecService.getAllTechnicians();
      return technicians.filter(t => t.status !== 'inactive');
    } catch (e) {
      console.error('Erro ao carregar técnicos:', e);
      return [];
    }
  }

  async getUnassignedCustomers(): Promise<CustomerRegistration[]> {
    const customers = await customerService.getAllCustomers();
    return customers.filter(c => 
      (!c.technician_id || c.technician_id === '') &&
      (c.status === 'novo_cadastro' || c.status === 'pendente' || c.status === 'novo')
    );
  }

  async getTechnicianServiceCount(technicianId: string): Promise<number> {
    try {
      const services = await tecService.getAllServices();
      const today = new Date().toDateString();
      return services.filter(s => 
        s.technician_id === technicianId && 
        new Date(s.created_at).toDateString() === today
      ).length;
    } catch {
      return 0;
    }
  }

  selectBestTechnician(technicians: Technician[], serviceCount: Map<string, number>): Technician | null {
    if (technicians.length === 0) return null;

    let bestTec = technicians[0];
    let minCount = serviceCount.get(bestTec.id) || 0;

    for (const tec of technicians) {
      const count = serviceCount.get(tec.id) || 0;
      if (count < minCount) {
        minCount = count;
        bestTec = tec;
      }
    }

    return bestTec;
  }

  async designateTechnician(): Promise<DesignationResult | null> {
    const technicians = await this.getAvailableTechnicians();
    if (technicians.length === 0) {
      console.log('🤖 Agente: Nenhum técnico disponível');
      return null;
    }

    const unassignedCustomers = await this.getUnassignedCustomers();
    if (unassignedCustomers.length === 0) {
      console.log('🤖 Agente: Nenhum cliente pendente para designar');
      return null;
    }

    const serviceCount = new Map<string, number>();
    for (const tec of technicians) {
      const count = await this.getTechnicianServiceCount(tec.id);
      serviceCount.set(tec.id, count);
    }

    const customer = unassignedCustomers[0];
    const bestTec = this.selectBestTechnician(technicians, serviceCount);

    if (!bestTec) return null;

    customer.technician_id = bestTec.id;
    customer.technician_name = bestTec.name;
    customerService.saveLocalCustomer(customer);

    const result: DesignationResult = {
      success: true,
      customerId: customer.id || 'unknown',
      technicianId: bestTec.id,
      technicianName: bestTec.name,
      reason: `Técnico com menor carga de trabalho (${serviceCount.get(bestTec.id) || 0} serviços hoje)`,
      timestamp: new Date().toISOString(),
    };

    this.logDesignation(result);
    this.agent.totalDesignations++;
    this.saveAgent();

    console.log(`🤖 Agente designou ${customer.full_name} para ${bestTec.name}`);

    return result;
  }

  async run(): Promise<DesignationResult[]> {
    console.log(`🤖 Agente de Designação executando às ${new Date().toLocaleString('pt-BR')}`);
    
    const results: DesignationResult[] = [];
    
    try {
      const unassigned = await this.getUnassignedCustomers();
      
      for (const customer of unassigned) {
        const result = await this.designateTechnician();
        if (result) results.push(result);
      }

      this.agent.lastRun = new Date().toISOString();
      this.agent.status = 'active';
      this.saveAgent();

    } catch (e) {
      console.error('🤖 Agente: Erro na execução:', e);
      this.agent.status = 'error';
      this.saveAgent();
    }

    return results;
  }

  start(): void {
    if (this.intervalId) {
      console.log('🤖 Agente já está rodando');
      return;
    }

    this.agent.status = 'active';
    this.saveAgent();

    console.log('🤖 Agente de Designação iniciado - funcionando 24h');

    this.run();

    this.intervalId = setInterval(() => {
      this.run();
    }, this.agent.config.minIntervalSeconds * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.agent.status = 'paused';
    this.saveAgent();
    console.log('🤖 Agente de Designação pausado');
  }

  getAgent(): DesignationAgent {
    return this.agent;
  }

  getLogs(): DesignationResult[] {
    return JSON.parse(localStorage.getItem(DESIGNATION_LOG_KEY) || '[]');
  }

  isRunning(): boolean {
    return this.agent.status === 'active';
  }
}

export const designationAgent = new DesignationAgentSystem();

export default designationAgent;
