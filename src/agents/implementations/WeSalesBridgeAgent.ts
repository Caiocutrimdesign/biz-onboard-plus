import { crmService, type Cliente as CustomerRegistration } from '@/lib/crmService';

export interface WeSalesConfig {
  apiKey: string;
  enabled: boolean;
  syncInterval: number;
  autoSync: boolean;
}

export interface WeSalesContact {
  name: string;
  email?: string;
  phone: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  vehicle?: string;
  plate?: string;
  plan?: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
  timestamp: string;
}

const WESALES_CONFIG_KEY = 'wesales_config';
const WESALES_SYNC_LOG_KEY = 'wesales_sync_log';
const WESALES_API_URL = 'https://api.wesales.io/v1/contacts';

class WeSalesBridgeAgent {
  private config: WeSalesConfig;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): WeSalesConfig {
    const stored = localStorage.getItem(WESALES_CONFIG_KEY);
    return stored ? JSON.parse(stored) : {
      apiKey: localStorage.getItem('wesales_api_key') || '',
      enabled: false,
      syncInterval: 300000,
      autoSync: false,
    };
  }

  saveConfig(config: Partial<WeSalesConfig>): void {
    this.config = { ...this.config, ...config };
    localStorage.setItem(WESALES_CONFIG_KEY, JSON.stringify(this.config));
    
    if (config.apiKey) {
      localStorage.setItem('wesales_api_key', config.apiKey);
    }
  }

  getConfig(): WeSalesConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.enabled;
  }

  async syncContact(customer: CustomerRegistration): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'WeSales não configurado' };
    }

    try {
      const contact: WeSalesContact = {
        name: customer.full_name || 'Cliente',
        email: customer.email || undefined,
        phone: customer.phone || '',
        document: customer.cpf_cnpj || undefined,
        address: customer.street ? `${customer.street}, ${customer.number || ''}` : undefined,
        city: customer.city || undefined,
        state: customer.state || undefined,
        vehicle: customer.brand && customer.model ? `${customer.brand} ${customer.model}` : undefined,
        plate: customer.plate || undefined,
        plan: customer.plan || undefined,
      };

      const response = await fetch(WESALES_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || `HTTP ${response.status}` 
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('WeSales sync error:', error);
      return { success: false, error: error.message || 'Erro de conexão' };
    }
  }

  async syncAllContacts(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      failed: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    if (!this.isConfigured()) {
      result.errors.push('WeSales não está configurado');
      return result;
    }

    try {
      const customers = await crmService.getClientes();
      const unsyncedCustomers = customers.filter(c => !c.synced);

      console.log(`🔄 Sincronizando ${unsyncedCustomers.length} contatos com WeSales...`);

      for (const customer of unsyncedCustomers) {
        const syncResult = await this.syncContact(customer);
        
        if (syncResult.success) {
          await crmService.updateCliente(customer.id, {
            synced: true,
          });
          result.synced++;
        } else {
          result.failed++;
          result.errors.push(`${customer.full_name}: ${syncResult.error}`);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      result.success = result.failed === 0;
      
      const logs = JSON.parse(localStorage.getItem(WESALES_SYNC_LOG_KEY) || '[]');
      logs.unshift(result);
      localStorage.setItem(WESALES_SYNC_LOG_KEY, JSON.stringify(logs.slice(0, 100)));

    } catch (error: any) {
      result.errors.push(`Erro geral: ${error.message}`);
    }

    return result;
  }

  async run(): Promise<SyncResult> {
    if (this.isRunning) {
      return { success: false, synced: 0, failed: 0, errors: ['Sincronização já em andamento'], timestamp: new Date().toISOString() };
    }

    this.isRunning = true;
    const result = await this.syncAllContacts();
    this.isRunning = false;

    return result;
  }

  startAutoSync(): void {
    if (this.intervalId || !this.config.autoSync) return;

    this.run();
    this.intervalId = setInterval(() => {
      if (this.config.autoSync) {
        this.run();
      }
    }, this.config.syncInterval);

    console.log('🔄 WeSales Bridge Agent - Auto-sync enabled');
  }

  stopAutoSync(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('⏸️ WeSales Bridge Agent - Auto-sync disabled');
  }

  getSyncLogs(): SyncResult[] {
    return JSON.parse(localStorage.getItem(WESALES_SYNC_LOG_KEY) || '[]');
  }

  getStatus(): { configured: boolean; enabled: boolean; running: boolean; lastSync: string | null } {
    const logs = this.getSyncLogs();
    return {
      configured: this.isConfigured(),
      enabled: this.config.enabled,
      running: this.isRunning,
      lastSync: logs[0]?.timestamp || null,
    };
  }
}

export const wesalesBridgeAgent = new WeSalesBridgeAgent();
export default wesalesBridgeAgent;
