import { supabase, isSupabaseConfigured, type DBCustomer } from './supabase';
import type { CustomerRegistration, CustomerStatus } from '@/types/customer';

const LOCAL_STORAGE_KEY = 'rastremix_customers';

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  disabled: number;
  pending: number;
}

export const customerService = {
  async getAllCustomers(): Promise<CustomerRegistration[]> {
    let customers: CustomerRegistration[] = [];

    const localCustomers = this.getLocalCustomers();
    
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const dbCustomers: CustomerRegistration[] = data.map((c: any) => ({
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
            status: c.status as CustomerStatus,
            notes: c.notes,
            created_at: c.created_at,
            updated_at: c.updated_at,
            synced: true,
          }));

          customers = dbCustomers;

          const localOnlyCustomers = localCustomers.filter(
            lc => !dbCustomers.some(dc => dc.id === lc.id || dc.id === lc.id?.replace('local-', ''))
          );
          customers = [...dbCustomers, ...localOnlyCustomers];
        }
      } catch (e) {
        console.error('Erro ao carregar do Supabase:', e);
      }
    } else {
      customers = localCustomers;
    }

    return customers;
  },

  getLocalCustomers(): CustomerRegistration[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLocalCustomer(customer: CustomerRegistration): void {
    const customers = this.getLocalCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    
    if (index >= 0) {
      customers[index] = { ...customers[index], ...customer };
    } else {
      customers.unshift(customer);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customers));
  },

  updateCustomerStatus(id: string, status: CustomerStatus): void {
    const customers = this.getLocalCustomers();
    const index = customers.findIndex(c => c.id === id);
    
    if (index >= 0) {
      customers[index].status = status;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customers));
    }

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('customers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Erro ao atualizar status no Supabase:', error);
        });
    }
  },

  deleteCustomer(id: string): void {
    const customers = this.getLocalCustomers();
    const filtered = customers.filter(c => c.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Erro ao deletar do Supabase:', error);
        });
    }
  },

  getStats(): CustomerStats {
    const customers = this.getLocalCustomers();
    
    return {
      total: customers.length,
      active: customers.filter(c => 
        c.status === 'active' || 
        c.status === 'cliente_ativado' || 
        c.status === 'ativo'
      ).length,
      inactive: customers.filter(c => c.status === 'inactive' || c.status === 'inativo').length,
      disabled: customers.filter(c => c.status === 'disabled' || c.status === 'desativado').length,
      pending: customers.filter(c => 
        c.status === 'novo_cadastro' || 
        c.status === 'novo' ||
        c.status === 'pendente'
      ).length,
    };
  },

  async syncToWeSales(customer: CustomerRegistration): Promise<{ success: boolean; message: string }> {
    const apiKey = localStorage.getItem('wesales_api_key');
    
    if (!apiKey) {
      return { success: false, message: 'API Key da WeSales não configurada' };
    }

    try {
      const wesalesData = {
        name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        document: customer.cpf_cnpj,
        address: customer.street ? `${customer.street}, ${customer.number}` : null,
        city: customer.city,
        state: customer.state,
        vehicle: customer.brand && customer.model ? `${customer.brand} ${customer.model}` : null,
        plate: customer.plate,
        plan: customer.plan,
      };

      const response = await fetch('https://api.wesales.io/v1/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wesalesData),
      });

      if (response.ok) {
        return { success: true, message: 'Cliente sincronizado com WeSales!' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Erro ao sincronizar' };
      }
    } catch (e) {
      console.error('Erro ao sincronizar com WeSales:', e);
      return { success: false, message: 'Erro de conexão com WeSales' };
    }
  },
};

export default customerService;
