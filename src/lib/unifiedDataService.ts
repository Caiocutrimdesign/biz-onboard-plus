import { supabase, isSupabaseConfigured } from './supabase';
import type { CustomerStatus } from '@/types/customer';

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
  satisfaction?: {
    rating: number;
    comment?: string;
    created_at: string;
  };
  tec_service_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface UnifiedTecnico {
  id: string;
  email: string;
  name: string;
  phone: string;
  cpf: string;
  password?: string;
  active: boolean;
  created_at: string;
}

export type UnifiedServiceStatus = 'pendente' | 'designado' | 'em_andamento' | 'finalizado' | 'cancelado';

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
  status: UnifiedServiceStatus;
  observations?: string;
  signature?: string;
  scheduled_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at?: string;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class UnifiedDataService {
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private cache: Map<string, any> = new Map();
  private isFetching: Map<string, boolean> = new Map();

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

  async getCustomers(forceRefresh = false): Promise<UnifiedCustomer[]> {
    if (this.isFetching.get('customers')) {
      return this.cache.get('customers') || [];
    }

    if (!forceRefresh && this.cache.has('customers')) {
      return this.cache.get('customers');
    }

    this.isFetching.set('customers', true);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const customers: UnifiedCustomer[] = data.map((c: any) => ({
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
          this.isFetching.set('customers', false);
          return customers;
        }
      }
    } catch (e) {
      console.error('Error fetching customers from Supabase:', e);
    }

    this.isFetching.set('customers', false);
    this.notify('customers', []);
    return [];
  }

  async saveCustomer(customer: Partial<UnifiedCustomer>): Promise<UnifiedCustomer> {
    const customerId = customer.id || generateUUID();
    const now = new Date().toISOString();

    const newCustomer: UnifiedCustomer = {
      id: customerId,
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
      satisfaction: customer.satisfaction,
      tec_service_id: customer.tec_service_id,
      created_at: customer.created_at || now,
      updated_at: now,
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
          satisfaction: newCustomer.satisfaction,
          tec_service_id: newCustomer.tec_service_id,
          created_at: newCustomer.created_at,
          updated_at: newCustomer.updated_at,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving to Supabase:', error);
        throw error;
      }

      await this.getCustomers(true);
      return { ...newCustomer, id: data?.id || customerId };
    }

    throw new Error('Supabase not configured');
  }

  async updateCustomerStatus(id: string, status: CustomerStatus): Promise<void> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('customers')
        .update({ status, updated_at: now })
        .eq('id', id);

      if (error) {
        console.error('Error updating status in Supabase:', error);
        throw error;
      }

      await this.getCustomers(true);
    } else {
      throw new Error('Supabase not configured');
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }
      await this.getCustomers(true);
    } else {
      throw new Error('Supabase not configured');
    }
  }

  async getTecnicos(forceRefresh = false): Promise<UnifiedTecnico[]> {
    if (this.isFetching.get('tecnicos')) {
      return this.cache.get('tecnicos') || [];
    }

    if (!forceRefresh && this.cache.has('tecnicos')) {
      return this.cache.get('tecnicos');
    }

    this.isFetching.set('tecnicos', true);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('tec_technicians')
          .select('*')
          .order('name');

        if (!error && data) {
          const tecnicos: UnifiedTecnico[] = data.map((t: any) => ({
            id: t.id,
            email: t.email,
            name: t.name,
            phone: t.phone,
            cpf: t.cpf,
            active: t.active ?? true,
            created_at: t.created_at,
          }));
          this.notify('tecnicos', tecnicos);
          this.isFetching.set('tecnicos', false);
          return tecnicos;
        }
      }
    } catch (e) {
      console.error('Error fetching tecnicos from Supabase:', e);
    }

    this.isFetching.set('tecnicos', false);
    this.notify('tecnicos', []);
    return [];
  }

  async saveTecnico(tecnico: Partial<UnifiedTecnico>): Promise<UnifiedTecnico> {
    const tecnicoId = tecnico.id || generateUUID();
    const now = new Date().toISOString();

    const newTecnico: UnifiedTecnico = {
      id: tecnicoId,
      email: tecnico.email || '',
      name: tecnico.name || '',
      phone: tecnico.phone || '',
      cpf: tecnico.cpf || '',
      active: tecnico.active ?? true,
      created_at: tecnico.created_at || now,
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('tec_technicians')
        .upsert({
          id: newTecnico.id,
          email: newTecnico.email,
          name: newTecnico.name,
          phone: newTecnico.phone,
          cpf: newTecnico.cpf,
          active: newTecnico.active,
          created_at: newTecnico.created_at,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving tecnico:', error);
        throw error;
      }

      await this.getTecnicos(true);
      return { ...newTecnico, id: data?.id || tecnicoId };
    }

    throw new Error('Supabase not configured');
  }

  async deleteTecnico(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('tec_technicians').delete().eq('id', id);
      if (error) {
        console.error('Error deleting tecnico:', error);
        throw error;
      }
      await this.getTecnicos(true);
    } else {
      throw new Error('Supabase not configured');
    }
  }

  async getServices(forceRefresh = false): Promise<UnifiedService[]> {
    if (this.isFetching.get('services')) {
      return this.cache.get('services') || [];
    }

    if (!forceRefresh && this.cache.has('services')) {
      return this.cache.get('services');
    }

    this.isFetching.set('services', true);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('tec_services')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const services: UnifiedService[] = data.map((s: any) => ({
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
            status: s.status || 'pendente',
            observations: s.observations,
            signature: s.signature,
            scheduled_date: s.scheduled_date,
            completed_date: s.completed_date,
            created_at: s.created_at,
            updated_at: s.updated_at,
          }));
          this.notify('services', services);
          this.isFetching.set('services', false);
          return services;
        }
      }
    } catch (e) {
      console.error('Error fetching services from Supabase:', e);
    }

    this.isFetching.set('services', false);
    this.notify('services', []);
    return [];
  }

  async saveService(service: Partial<UnifiedService>): Promise<UnifiedService> {
    const serviceId = service.id || generateUUID();
    const now = new Date().toISOString();

    const newService: UnifiedService = {
      id: serviceId,
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
      created_at: service.created_at || now,
      updated_at: now,
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

      if (error) {
        console.error('Error saving service:', error);
        throw error;
      }

      await this.getServices(true);
      return { ...newService, id: data?.id || serviceId };
    }

    throw new Error('Supabase not configured');
  }

  async updateServiceStatus(id: string, status: UnifiedService['status']): Promise<void> {
    const now = new Date().toISOString();
    const updates: any = { status, updated_at: now };

    if (status === 'finalizado') {
      updates.completed_date = now;
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('tec_services')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating service status:', error);
        throw error;
      }

      await this.getServices(true);
    } else {
      throw new Error('Supabase not configured');
    }
  }

  subscribeToRealtime() {
    if (!isSupabaseConfigured() || !supabase) return () => {};

    const customersChannel = supabase
      .channel('customers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        this.getCustomers(true);
      })
      .subscribe();

    const tecnicosChannel = supabase
      .channel('tecnicos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tec_technicians' }, () => {
        this.getTecnicos(true);
      })
      .subscribe();

    const servicesChannel = supabase
      .channel('services-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tec_services' }, () => {
        this.getServices(true);
      })
      .subscribe();

    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_users' }, () => {
        // User changes don't need automatic refresh
      })
      .subscribe();

    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(tecnicosChannel);
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(usersChannel);
    };
  }

  async refreshAll() {
    await Promise.all([
      this.getCustomers(true),
      this.getTecnicos(true),
      this.getServices(true)
    ]);
  }
}

export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;
