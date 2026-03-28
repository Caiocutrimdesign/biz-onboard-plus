import { useState, useEffect, useCallback } from 'react';
import { supabase, type DBLead, type DBCustomer } from '@/lib/supabase';

export function useLeads() {
  const [leads, setLeads] = useState<DBLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLeads(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const addLead = async (lead: Omit<DBLead, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    
    if (error) throw error;
    await fetchLeads();
    return data;
  };

  const updateLead = async (id: string, updates: Partial<DBLead>) => {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    await fetchLeads();
    return data;
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
    await fetchLeads();
  };

  const moveLeadToStage = async (id: string, stageId: string) => {
    return updateLead(id, { stage_id: stageId });
  };

  return { leads, loading, error, addLead, updateLead, deleteLead, moveLeadToStage, refetch: fetchLeads };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<DBCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Erro ao buscar customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addCustomer = async (customer: Omit<DBCustomer, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      const leadData = {
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        company: null,
        document: data.cpf_cnpj,
        address: data.street ? `${data.street}, ${data.number}` : null,
        city: data.city,
        state: data.state,
        status: 'novo' as const,
        source: 'website' as const,
        priority: 'media' as const,
        value: 0,
        tags: [],
        notes: `Veículo: ${data.brand} ${data.model} (${data.plate})\nPlano: ${data.plan}\nForma de pagamento: ${data.payment_method}`,
        owner_id: null,
        pipeline_id: 'default',
        stage_id: 'stage-1',
      };

      await supabase.from('leads').insert(leadData);
    }

    await fetchCustomers();
    return data;
  };

  return { customers, loading, addCustomer, refetch: fetchCustomers };
}

export function usePipeline() {
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const { data, error } = await supabase
          .from('pipeline_stages')
          .select('*')
          .order('order_index');

        if (error) throw error;
        setStages(data || []);
      } catch (err) {
        console.error('Erro ao buscar stages:', err);
        setStages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, []);

  return { stages, loading };
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const calculateAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const [leadsResult, customersResult] = await Promise.all([
        supabase.from('leads').select('*'),
        supabase.from('customers').select('*'),
      ]);

      const leads = leadsResult.data || [];
      const customers = customersResult.data || [];

      const totalLeads = leads.length;
      const totalCustomers = customers.length;
      
      const leadsByStatus = leads.reduce((acc: any, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});

      const leadsBySource = leads.reduce((acc: any, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {});

      const revenue = leads
        .filter(l => l.status === 'ganho')
        .reduce((sum, l) => sum + (l.value || 0), 0);

      const conversionRate = totalLeads > 0 
        ? ((leadsByStatus['ganho'] || 0) / totalLeads) * 100 
        : 0;

      const wonLeads = leads.filter(l => l.status === 'ganho');
      const averageDealValue = wonLeads.length > 0 
        ? wonLeads.reduce((sum, l) => sum + (l.value || 0), 0) / wonLeads.length 
        : 0;

      const now = new Date();
      const thisMonth = leads.filter(l => {
        const d = new Date(l.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setAnalytics({
        totalLeads,
        totalCustomers,
        leadsByStatus,
        leadsBySource,
        revenue,
        conversionRate,
        averageDealValue,
        newLeadsThisMonth: thisMonth,
        totalDeals: wonLeads.length,
        dealsWonThisMonth: wonLeads.filter(l => {
          const d = new Date(l.updated_at);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
      });
    } catch (err) {
      console.error('Erro ao calcular analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  return { analytics, loading, refetch: calculateAnalytics };
}

export function useTags() {
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase.from('tags').select('*');
      setTags(data || []);
    };
    fetchTags();
  }, []);

  return { tags };
}

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('crm_users').select('*').eq('active', true);
      setUsers(data || []);
    };
    fetchUsers();
  }, []);

  return { users };
}
