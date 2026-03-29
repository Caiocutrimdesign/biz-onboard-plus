import { supabase, isSupabaseConfigured } from './supabase';
import type { CustomerRegistration, CustomerStatus } from '@/types/customer';
import type { Technician } from '@/types/tec';
import type { Service } from '@/types/tec';

const CUSTOMERS_KEY = 'rastremix_customers';
const TECNICOS_KEY = 'rastremix_tecnicos';
const SERVICES_KEY = 'tec_services';

export interface UnifiedCustomer {
  id: string;
  full_name: string;
  phone: string;
  cpf_cnpj?: string;
  email?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  vehicle_type?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
  renavam?: string;
  chassis?: string;
  plan?: string;
  payment_method?: string;
  status: CustomerStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface UnifiedTecnico {
  id: string;
  email: string;
  name: string;
  phone: string;
  cpf: string;
  active: boolean;
  created_at: string;
}

export interface UnifiedService {
  id: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_address?: string;
  technician_id: string;
  technician_name?: string;
  vehicle: string;
  plate: string;
  type: string;
  status: string;
  observations?: string;
  signature?: string;
  scheduled_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at?: string;
}

class UnifiedDataService {
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private cache: Map<string, any> = new Map();

  subscribe(collection: string, callback: (data: any) => void) {
    if (!this.subscribers.has(collection)) {
      this.subscribers.set(collection, new Set());
    }
    this.subscribers.get(collection)!.add(callback);
    return () => this.subscribers.get(collection)?.delete(callback);
  }

  notify(collection: string, data: any) {
    this.cache.set(collection, data);
    this.subscribers.get(collection)?.forEach(cb => cb(data));
  }

  async getCustomers(): Promise<UnifiedCustomer[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const customers = data.map((c: any) => ({
            id: c.id,
            full_name: c.full_name,
            phone: c.phone,
            cpf_cnpj: c.cpf_cnpj,
            email: c.email,
            cep: c.cep,
            street: c.street,
            number: c.number,
            neighborhood: c.neighborhood,
            city: c.city,
            state: c.state,
            vehicle_type: c.vehicle_type,
            plate: c.plate,
            brand: c.brand,
            model: c.model,
            year: c.year,
            color: c.color,
            renavam: c.renavam,
            chassis: c.chassis,
            plan: c.plan,
            payment_method: c.payment_method,
            status: c.status || 'novo_cadastro',
            created_at: c.created_at,
            updated_at: c.updated_at,
          }));
          this.notify('customers', customers);
          return customers;
        }
      } catch (e) {
        console.error('Error fetching customers from Supabase:', e);
      }
    }

    const local = this.getLocalCustomers();
    this.notify('customers', local);
    return local;
  }

  getLocalCustomers(): UnifiedCustomer[] {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveCustomer(customer: Partial<UnifiedCustomer>): Promise<UnifiedCustomer> {
    const newCustomer: UnifiedCustomer = {
      id: customer.id || `cust_${Date.now()}`,
      full_name: customer.full_name || '',
      phone: customer.phone || '',
      cpf_cnpj: customer.cpf_cnpj,
      email: customer.email,
      cep: customer.cep,
      street: customer.street,
      number: customer.number,
      neighborhood: customer.neighborhood,
      city: customer.city,
      state: customer.state,
      vehicle_type: customer.vehicle_type,
      plate: customer.plate,
      brand: customer.brand,
      model: customer.model,
      year: customer.year,
      color: customer.color,
      renavam: customer.renavam,
      chassis: customer.chassis,
      plan: customer.plan,
      payment_method: customer.payment_method,
      status: customer.status || 'novo_cadastro',
      created_at: customer.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('customers')
        .upsert({
          id: newCustomer.id,
          full_name: newCustomer.full_name,
          phone: newCustomer.phone,
          cpf_cnpj: newCustomer.cpf_cnpj,
          email: newCustomer.email,
          cep: newCustomer.cep,
          street: newCustomer.street,
          number: newCustomer.number,
          neighborhood: newCustomer.neighborhood,
          city: newCustomer.city,
          state: newCustomer.state,
          vehicle_type: newCustomer.vehicle_type,
          plate: newCustomer.plate,
          brand: newCustomer.brand,
          model: newCustomer.model,
          year: newCustomer.year,
          color: newCustomer.color,
          renavam: newCustomer.renavam,
          chassis: newCustomer.chassis,
          plan: newCustomer.plan,
          payment_method: newCustomer.payment_method,
          status: newCustomer.status,
          created_at: newCustomer.created_at,
          updated_at: newCustomer.updated_at,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving to Supabase:', error);
      } else if (data) {
        const customers = await this.getCustomers();
        return { ...newCustomer, id: data.id };
      }
    }

    const localCustomers = this.getLocalCustomers();
    const index = localCustomers.findIndex(c => c.id === newCustomer.id);
    if (index >= 0) {
      localCustomers[index] = newCustomer;
    } else {
      localCustomers.unshift(newCustomer);
    }
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(localCustomers));
    this.notify('customers', localCustomers);
    return newCustomer;
  }

  async updateCustomerStatus(id: string, status: CustomerStatus): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('customers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating status in Supabase:', error);
      }
    }

    const customers = await this.getCustomers();
    const updated = customers.map(c => c.id === id ? { ...c, status, updated_at: new Date().toISOString() } : c);
    this.notify('customers', updated);
  }

  async deleteCustomer(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('customers').delete().eq('id', id);
    }

    const customers = await this.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(filtered));
    this.notify('customers', filtered);
  }

  async getTecnicos(): Promise<UnifiedTecnico[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('tec_technicians')
          .select('*')
          .order('name');

        if (!error && data) {
          const tecnicos = data.map((t: any) => ({
            id: t.id,
            email: t.email,
            name: t.name,
            phone: t.phone,
            cpf: t.cpf,
            active: t.active ?? true,
            created_at: t.created_at,
          }));
          this.notify('tecnicos', tecnicos);
          return tecnicos;
        }
      } catch (e) {
        console.error('Error fetching tecnicos from Supabase:', e);
      }
    }

    const local = this.getLocalTecnicos();
    this.notify('tecnicos', local);
    return local;
  }

  getLocalTecnicos(): UnifiedTecnico[] {
    try {
      const data = localStorage.getItem(TECNICOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveTecnico(tecnico: Partial<UnifiedTecnico>): Promise<UnifiedTecnico> {
    const newTecnico: UnifiedTecnico = {
      id: tecnico.id || `tech_${Date.now()}`,
      email: tecnico.email || '',
      name: tecnico.name || '',
      phone: tecnico.phone || '',
      cpf: tecnico.cpf || '',
      active: tecnico.active ?? true,
      created_at: tecnico.created_at || new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('tec_technicians')
        .upsert(newTecnico)
        .select()
        .single();

      if (!error && data) {
        const tecnicos = await this.getTecnicos();
        return { ...newTecnico, id: data.id };
      }
    }

    const local = this.getLocalTecnicos();
    const index = local.findIndex(t => t.id === newTecnico.id);
    if (index >= 0) {
      local[index] = newTecnico;
    } else {
      local.push(newTecnico);
    }
    localStorage.setItem(TECNICOS_KEY, JSON.stringify(local));
    this.notify('tecnicos', local);
    return newTecnico;
  }

  async deleteTecnico(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('tec_technicians').delete().eq('id', id);
    }

    const tecnicos = await this.getTecnicos();
    const filtered = tecnicos.filter(t => t.id !== id);
    localStorage.setItem(TECNICOS_KEY, JSON.stringify(filtered));
    this.notify('tecnicos', filtered);
  }

  async getServices(): Promise<UnifiedService[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('tec_services')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const services = data.map((s: any) => ({
            id: s.id,
            client_id: s.client_id,
            client_name: s.client_name,
            client_phone: s.client_phone,
            client_address: s.client_address,
            technician_id: s.technician_id,
            technician_name: s.technician_name,
            vehicle: s.vehicle,
            plate: s.plate,
            type: s.service_type,
            status: s.status,
            observations: s.observations,
            signature: s.signature,
            scheduled_date: s.scheduled_date,
            completed_date: s.completed_date,
            created_at: s.created_at,
            updated_at: s.updated_at,
          }));
          this.notify('services', services);
          return services;
        }
      } catch (e) {
        console.error('Error fetching services from Supabase:', e);
      }
    }

    const local = this.getLocalServices();
    this.notify('services', local);
    return local;
  }

  getLocalServices(): UnifiedService[] {
    try {
      const data = localStorage.getItem(SERVICES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveService(service: Partial<UnifiedService>): Promise<UnifiedService> {
    const newService: UnifiedService = {
      id: service.id || `svc_${Date.now()}`,
      client_id: service.client_id,
      client_name: service.client_name || '',
      client_phone: service.client_phone || '',
      client_address: service.client_address,
      technician_id: service.technician_id || '',
      technician_name: service.technician_name,
      vehicle: service.vehicle || '',
      plate: service.plate || '',
      type: service.type || '',
      status: service.status || 'pendente',
      observations: service.observations,
      signature: service.signature,
      scheduled_date: service.scheduled_date,
      completed_date: service.completed_date,
      created_at: service.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('tec_services')
        .upsert({
          id: newService.id,
          client_id: newService.client_id,
          client_name: newService.client_name,
          client_phone: newService.client_phone,
          client_address: newService.client_address,
          technician_id: newService.technician_id,
          technician_name: newService.technician_name,
          vehicle: newService.vehicle,
          plate: newService.plate,
          service_type: newService.type,
          status: newService.status,
          observations: newService.observations,
          signature: newService.signature,
          scheduled_date: newService.scheduled_date,
          completed_date: newService.completed_date,
          created_at: newService.created_at,
          updated_at: newService.updated_at,
        })
        .select()
        .single();

      if (!error && data) {
        const services = await this.getServices();
        return { ...newService, id: data.id };
      }
    }

    const local = this.getLocalServices();
    const index = local.findIndex(s => s.id === newService.id);
    if (index >= 0) {
      local[index] = newService;
    } else {
      local.unshift(newService);
    }
    localStorage.setItem(SERVICES_KEY, JSON.stringify(local));
    this.notify('services', local);
    return newService;
  }

  subscribeToRealtime() {
    if (!isSupabaseConfigured() || !supabase) return () => {};

    const customersChannel = supabase
      .channel('customers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        this.getCustomers();
      })
      .subscribe();

    const tecnicosChannel = supabase
      .channel('tecnicos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tec_technicians' }, () => {
        this.getTecnicos();
      })
      .subscribe();

    const servicesChannel = supabase
      .channel('services-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tec_services' }, () => {
        this.getServices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(tecnicosChannel);
      supabase.removeChannel(servicesChannel);
    };
  }

  async migrateLocalToSupabase(): Promise<{ customers: number; tecnicos: number; services: number }> {
    const results = { customers: 0, tecnicos: 0, services: 0 };

    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, skipping migration');
      return results;
    }

    try {
      const localCustomers = this.getLocalCustomers();
      if (localCustomers.length > 0) {
        console.log(`Migrating ${localCustomers.length} customers to Supabase...`);
        
        const { data: existingCustomers } = await supabase
          .from('customers')
          .select('id');
        
        const existingIds = new Set(existingCustomers?.map(c => c.id) || []);
        const toMigrate = localCustomers.filter(c => !existingIds.has(c.id));
        
        if (toMigrate.length > 0) {
          const { error } = await supabase.from('customers').insert(toMigrate);
          if (error) {
            console.error('Error migrating customers:', error);
          } else {
            results.customers = toMigrate.length;
            console.log(`Migrated ${toMigrate.length} customers`);
          }
        }
      }

      const localTecnicos = this.getLocalTecnicos();
      if (localTecnicos.length > 0) {
        console.log(`Migrating ${localTecnicos.length} tecnicos to Supabase...`);
        
        const { data: existingTecnicos } = await supabase
          .from('tec_technicians')
          .select('id');
        
        const existingIds = new Set(existingTecnicos?.map(t => t.id) || []);
        const toMigrate = localTecnicos.filter(t => !existingIds.has(t.id));
        
        if (toMigrate.length > 0) {
          const { error } = await supabase.from('tec_technicians').insert(toMigrate);
          if (error) {
            console.error('Error migrating tecnicos:', error);
          } else {
            results.tecnicos = toMigrate.length;
            console.log(`Migrated ${toMigrate.length} tecnicos`);
          }
        }
      }

      const localServices = this.getLocalServices();
      if (localServices.length > 0) {
        console.log(`Migrating ${localServices.length} services to Supabase...`);
        
        const { data: existingServices } = await supabase
          .from('tec_services')
          .select('id');
        
        const existingIds = new Set(existingServices?.map(s => s.id) || []);
        const toMigrate = localServices.filter(s => !existingIds.has(s.id));
        
        if (toMigrate.length > 0) {
          const servicesToInsert = toMigrate.map(s => ({
            id: s.id,
            client_id: s.client_id,
            client_name: s.client_name,
            client_phone: s.client_phone,
            client_address: s.client_address,
            technician_id: s.technician_id,
            technician_name: s.technician_name,
            vehicle: s.vehicle,
            plate: s.plate,
            service_type: s.type,
            status: s.status,
            observations: s.observations,
            signature: s.signature,
            scheduled_date: s.scheduled_date,
            completed_date: s.completed_date,
            created_at: s.created_at,
            updated_at: s.updated_at,
          }));
          
          const { error } = await supabase.from('tec_services').insert(servicesToInsert);
          if (error) {
            console.error('Error migrating services:', error);
          } else {
            results.services = toMigrate.length;
            console.log(`Migrated ${toMigrate.length} services`);
          }
        }
      }

      await this.refreshAll();
    } catch (e) {
      console.error('Migration error:', e);
    }

    return results;
  }

  async refreshAll() {
    await this.getCustomers();
    await this.getTecnicos();
    await this.getServices();
  }
}

export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;
