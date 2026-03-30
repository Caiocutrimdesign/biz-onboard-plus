import { supabase } from './supabaseClient';
import { generateUUID } from './utils';
import { toast } from 'sonner';

// Types for CRM
export interface Cliente {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  cpf_cnpj?: string | null;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  plan?: string | null;
  birth_date?: string | null;
  // Vehicle info (stored in customers table for now)
  vehicle_type?: string | null;
  plate?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: string | null;
  color?: string | null;
  renavam?: string | null;
  chassis?: string | null;
  // Technician info
  technician_id?: string | null;
  technician_name?: string | null;
  // Sync info
  synced?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface Servico {
  id: string;
  client_id: string | null;
  client_name: string;
  client_phone?: string | null;
  client_address?: string | null;
  technician_id: string;
  technician_name?: string | null;
  type: string;
  status: string;
  scheduled_date: string | null;
  completed_date?: string | null;
  vehicle: string;
  plate: string;
  observations?: string | null;
  signature?: string | null;
  photos?: ServicoPhoto[];
  created_at?: string;
  updated_at?: string;
}

export interface ServicoPhoto {
  id: string;
  service_id: string;
  url: string;
  type: string;
  created_at?: string;
}

export interface ServicoSignature {
  id: string;
  service_id: string;
  signature_url: string;
  signed_by: string;
  created_at?: string;
}

export interface CRMUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'user';
  active: boolean;
  created_at?: string;
}

class CRMService {
  // CLIENTES (Customers table)
  async getClientes() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Cliente[];
    } catch (error: any) {
      console.error('Error fetching clientes:', error.message);
      return [];
    }
  }

  async createCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...cliente, id: generateUUID() }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Cliente cadastrado com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating cliente:', error.message);
      toast.error('Erro ao cadastrar cliente');
      return { success: false, error: error.message };
    }
  }

  async updateCliente(id: string, updates: Partial<Cliente>) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Cliente atualizado com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating cliente:', error.message);
      toast.error('Erro ao atualizar cliente');
      return { success: false, error: error.message };
    }
  }

  async deleteCliente(id: string) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Cliente excluído com sucesso!');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting cliente:', error.message);
      toast.error('Erro ao excluir cliente');
      return { success: false, error: error.message };
    }
  }

  // SERVIÇOS / AGENDAMENTOS (tec_services table)
  async getServicos(tecnicoId?: string) {
    try {
      let query = supabase
        .from('tec_services')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (tecnicoId) {
        query = query.eq('technician_id', tecnicoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as any as Servico[];
    } catch (error: any) {
      console.error('Error fetching servicos:', error.message);
      return [];
    }
  }

  async createServico(servico: Omit<Servico, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('tec_services')
        .insert([{ ...servico, id: generateUUID() }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Serviço/Agendamento criado com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating servico:', error.message);
      toast.error('Erro ao criar serviço');
      return { success: false, error: error.message };
    }
  }

  async updateServico(id: string, updates: Partial<Servico>) {
    try {
      const { data, error } = await supabase
        .from('tec_services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Serviço atualizado!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating servico:', error.message);
      toast.error('Erro ao atualizar serviço');
      return { success: false, error: error.message };
    }
  }

  async deleteServico(id: string) {
    try {
      const { error } = await supabase
        .from('tec_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Serviço excluído!');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting servico:', error.message);
      toast.error('Erro ao excluir serviço');
      return { success: false, error: error.message };
    }
  }

  // TECHNICIANS (Profiles table)
  async getTecnicos() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo', 'tecnico');

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching tecnicos:', error.message);
      return [];
    }
  }

  async updateTecnico(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Técnico atualizado!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating tecnico:', error.message);
      toast.error('Erro ao atualizar técnico');
      return { success: false, error: error.message };
    }
  }

  async deleteTecnico(id: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Técnico removido!');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting tecnico:', error.message);
      toast.error('Erro ao excluir técnico');
      return { success: false, error: error.message };
    }
  }

  // CRM USERS (crm_users table)
  async getCRMUsers() {
    try {
      const { data, error } = await supabase
        .from('crm_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching crm users:', error.message);
      return [];
    }
  }

  async createCRMUser(user: any) {
    try {
      const { data, error } = await supabase
        .from('crm_users')
        .insert([{ ...user, id: user.id || generateUUID() }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Usuário criado com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating crm user:', error.message);
      toast.error('Erro ao criar usuário');
      return { success: false, error: error.message };
    }
  }

  async updateCRMUser(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('crm_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Usuário atualizado!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating crm user:', error.message);
      toast.error('Erro ao atualizar usuário');
      return { success: false, error: error.message };
    }
  }

  async deleteCRMUser(id: string) {
    try {
      const { error } = await supabase
        .from('crm_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Usuário excluído!');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting crm user:', error.message);
      toast.error('Erro ao excluir usuário');
      return { success: false, error: error.message };
    }
  }

  // --- Specialty Methods (Photos, Signatures, Agents) ---

  async savePhotos(serviceId: string, photos: Array<{ url: string; type: string }>) {
    if (!photos.length) return { success: true };
    try {
      const { error } = await supabase
        .from('tec_service_photos')
        .insert(photos.map(p => ({ ...p, service_id: serviceId })));
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error saving photos:', error);
      return { success: false, error: error.message };
    }
  }

  async getPhotos(serviceId: string) {
    try {
      const { data, error } = await supabase
        .from('tec_service_photos')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting photos:', error);
      return [];
    }
  }

  async saveSignatures(serviceId: string, signatures: Array<{ url: string; signed_by: string }>) {
    if (!signatures.length) return { success: true };
    try {
      const { error } = await supabase
        .from('tec_service_signatures')
        .insert(signatures.map(s => ({
          service_id: serviceId,
          signature_url: s.url,
          signed_by: s.signed_by
        })));
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error saving signatures:', error);
      return { success: false, error: error.message };
    }
  }

  async getSignatures(serviceId: string) {
    try {
      const { data, error } = await supabase
        .from('tec_service_signatures')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting signatures:', error);
      return [];
    }
  }

  async uploadPhoto(file: File, serviceId: string, type: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // First, try to upload to Supabase Storage
      const fileName = `tec-photos/${serviceId}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('tec-photos')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });
      
      if (error) {
        console.warn('Supabase upload failed, using base64 fallback:', error.message);
        // Fallback to base64 if Supabase storage fails
        return this.convertToBase64(file);
      }

      const { data: urlData } = supabase.storage
        .from('tec-photos')
        .getPublicUrl(data.path);

      console.log('Photo uploaded successfully:', urlData.publicUrl);
      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Upload error:', error);
      // Fallback to base64 on any error
      return this.convertToBase64(file);
    }
  }

  private convertToBase64(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Using base64 fallback for photo');
        resolve({ success: true, url: reader.result as string });
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to convert to base64' });
      };
      reader.readAsDataURL(file);
    });
  }

  async ensureStorageBucket(bucketId: string): Promise<boolean> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.id === bucketId);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(bucketId, {
          public: true,
          fileSizeLimit: 10485760
        });
        if (error) {
          console.warn('Could not create bucket:', error);
          return false;
        }
        console.log('Bucket created:', bucketId);
      }
      return true;
    } catch (error) {
      console.warn('Could not verify/create bucket:', error);
      return false;
    }
  }

  async uploadSignature(base64: string, serviceId: string, type: string) {
    try {
      // Ensure bucket exists
      await this.ensureStorageBucket('tec-photos');
      
      // Convert base64 to Blob
      const response = await fetch(base64);
      const blob = await response.blob();
      
      const fileName = `${serviceId}/sig_${type}_${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from('tec-photos')
        .upload(fileName, blob, { 
          contentType: 'image/png',
          upsert: true 
        });
        
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('tec-photos')
        .getPublicUrl(data.path);

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Error uploading signature:', error);
      // Fallback: return base64 URL directly
      return { success: true, url: base64 };
    }
  }

  // REAL-TIME SUBSCRIPTION
  subscribeToChanges(table: 'customers' | 'tec_services' | 'profiles', callback: () => void) {
    return supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          console.log(`Change detected in ${table}:`, payload);
          callback();
        }
      )
      .subscribe();
  }
}

export const crmService = new CRMService();
