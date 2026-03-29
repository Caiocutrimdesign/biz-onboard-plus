import { supabase, isSupabaseConfigured } from './supabase';
import type { Service, Technician, TECAgent, ServicePhoto, PhotoType } from '@/types/tec';

const SERVICES_KEY = 'tec_services';
const TECHNICIANS_KEY = 'tec_technicians';
const TEC_AGENTS_KEY = 'tec_agents';
const PHOTOS_KEY = 'tec_photos';
const SIGNATURES_KEY = 'tec_signatures';

export const tecService = {
  async saveService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const newService: Service = {
      ...service,
      id: `service_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('tec_services')
        .insert({
          client_id: newService.client_id || null,
          client_name: newService.client_name,
          client_phone: newService.client_phone,
          client_address: newService.client_address || null,
          technician_id: newService.technician_id,
          technician_name: newService.technician_name || null,
          vehicle: newService.vehicle,
          plate: newService.plate,
          service_type: newService.type,
          status: newService.status,
          observations: newService.observations || null,
          signature: newService.signature || null,
          completed_date: newService.status === 'concluido' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving service to Supabase:', error);
        throw error;
      }

      return { ...newService, id: data.id };
    }

    const services = this.getServices();
    services.unshift(newService);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));

    return newService;
  },

  getServices(): Service[] {
    try {
      const data = localStorage.getItem(SERVICES_KEY);
      const services = data ? JSON.parse(data) : [];
      return services.map((s: Service) => ({
        ...s,
        photos: this.getPhotos(s.id),
      }));
    } catch {
      return [];
    }
  },

  async getAllServices(): Promise<Service[]> {
    let allServices: Service[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('tec_services')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          allServices = await Promise.all(
            data.map(async (s: any) => {
              const dbPhotos = await this.getPhotosFromDB(s.id);
              const localPhotos = this.getPhotos(s.id);
              const allPhotos = [...dbPhotos];
              
              localPhotos.forEach((lp: ServicePhoto) => {
                if (!allPhotos.some(p => p.id === lp.id)) {
                  allPhotos.push(lp);
                }
              });

              return {
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
                photos: allPhotos,
                created_at: s.created_at,
                updated_at: s.updated_at,
              };
            })
          );
        }
      } catch (e) {
        console.error('Error loading from Supabase, using local:', e);
      }
    }

    const localServices = this.getServices();
    
    localServices.forEach((ls: Service) => {
      if (!allServices.some((s: Service) => s.id === ls.id)) {
        allServices.push(ls);
      }
    });

    allServices.sort((a: Service, b: Service) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return allServices;
  },

  updateService(id: string, updates: Partial<Service>): Service | null {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === id);
    if (index === -1) return null;

    services[index] = {
      ...services[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('tec_services')
        .update(updates)
        .eq('id', id);
    }

    return services[index];
  },

  savePhotosLocal(serviceId: string, photos: Omit<ServicePhoto, 'id' | 'service_id' | 'created_at'>[]) {
    const allPhotos = JSON.parse(localStorage.getItem(PHOTOS_KEY) || '{}');
    const existingPhotos = allPhotos[serviceId] || [];
    const newPhotos: ServicePhoto[] = photos.map(p => ({
      ...p,
      id: `photo_${Date.now()}_${Math.random()}`,
      service_id: serviceId,
      created_at: new Date().toISOString(),
    }));
    allPhotos[serviceId] = [...existingPhotos, ...newPhotos];
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(allPhotos));
  },

  async savePhotos(serviceId: string, photos: Omit<ServicePhoto, 'id' | 'service_id' | 'created_at'>[]) {
    if (!photos.length) return;

    if (!isSupabaseConfigured() || !supabase) {
      this.savePhotosLocal(serviceId, photos);
      return;
    }

    try {
      const photosToSave = photos.map(p => ({
        url: p.url,
        type: p.type,
        service_id: serviceId,
      }));

      const { error } = await supabase
        .from('tec_service_photos')
        .insert(photosToSave);

      if (error) {
        console.error('Error saving photos to Supabase, saving locally:', error);
        this.savePhotosLocal(serviceId, photos);
      }
    } catch (e) {
      console.error('Error saving photos:', e);
      this.savePhotosLocal(serviceId, photos);
    }
  },

  async saveSignatures(serviceId: string, signatures: { url: string; signed_by: string }[]) {
    if (!signatures.length) return;

    if (!isSupabaseConfigured() || !supabase) {
      this.saveSignaturesLocal(serviceId, signatures);
      return;
    }

    try {
      const signaturesToSave = signatures.map(s => ({
        service_id: serviceId,
        signature_url: s.url,
        signed_by: s.signed_by,
      }));

      const { error } = await supabase
        .from('tec_service_signatures')
        .insert(signaturesToSave);

      if (error) {
        console.error('Error saving signatures to Supabase, saving locally:', error);
        this.saveSignaturesLocal(serviceId, signatures);
      }
    } catch (e) {
      console.error('Error saving signatures:', e);
      this.saveSignaturesLocal(serviceId, signatures);
    }
  },

  saveSignaturesLocal(serviceId: string, signatures: { url: string; signed_by: string }[]) {
    const allSignatures = JSON.parse(localStorage.getItem(SIGNATURES_KEY) || '{}');
    const existingSignatures = allSignatures[serviceId] || [];
    const newSignatures = signatures.map(s => ({
      id: `sig_${Date.now()}_${Math.random()}`,
      service_id: serviceId,
      signature_url: s.url,
      signed_by: s.signed_by,
      created_at: new Date().toISOString(),
    }));
    allSignatures[serviceId] = [...existingSignatures, ...newSignatures];
    localStorage.setItem(SIGNATURES_KEY, JSON.stringify(allSignatures));
  },

  getSignatures(serviceId: string): Array<{ id: string; service_id: string; signature_url: string; signed_by: string; created_at: string }> {
    const allSignatures = JSON.parse(localStorage.getItem(SIGNATURES_KEY) || '{}');
    return allSignatures[serviceId] || [];
  },

  getPhotos(serviceId: string): ServicePhoto[] {
    const allPhotos = JSON.parse(localStorage.getItem(PHOTOS_KEY) || '{}');
    return allPhotos[serviceId] || [];
  },

  async getPhotosFromDB(serviceId: string): Promise<ServicePhoto[]> {
    const localPhotos = this.getPhotos(serviceId);
    
    if (!isSupabaseConfigured() || !supabase) {
      return localPhotos;
    }

    try {
      const { data, error } = await supabase
        .from('tec_service_photos')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: true });

      if (error) return localPhotos;
      
      const dbPhotos: ServicePhoto[] = data || [];
      
      const allPhotos = [...dbPhotos];
      localPhotos.forEach((lp: ServicePhoto) => {
        if (!allPhotos.some(p => p.id === lp.id)) {
          allPhotos.push(lp);
        }
      });
      
      return allPhotos;
    } catch {
      return localPhotos;
    }
  },

  async uploadPhoto(file: File, serviceId: string, type: PhotoType): Promise<string> {
    if (isSupabaseConfigured() && supabase) {
      const fileName = `${serviceId}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('tec-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('tec-photos')
        .getPublicUrl(data.path);

      await this.savePhotos(serviceId, [{
        url: urlData.publicUrl,
        type,
      }]);

      return urlData.publicUrl;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  },

  getTechnicians(): Technician[] {
    try {
      const data = localStorage.getItem(TECHNICIANS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async getAllTechnicians(): Promise<Technician[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('tec_technicians')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
    return this.getTechnicians();
  },

  saveTechnician(technician: Omit<Technician, 'id' | 'created_at'>): Technician {
    const newTechnician: Technician = {
      ...technician,
      id: `tech_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      supabase.from('tec_technicians').insert(newTechnician);
    }

    const technicians = this.getTechnicians();
    technicians.push(newTechnician);
    localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));

    return newTechnician;
  },

  updateTechnician(id: string, updates: Partial<Technician>): Technician | null {
    const technicians = this.getTechnicians();
    const index = technicians.findIndex(t => t.id === id);
    if (index === -1) return null;

    technicians[index] = { ...technicians[index], ...updates };
    localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));

    if (isSupabaseConfigured() && supabase) {
      supabase.from('tec_technicians').update(updates).eq('id', id);
    }

    return technicians[index];
  },

  deleteTechnician(id: string): boolean {
    const technicians = this.getTechnicians();
    const filtered = technicians.filter(t => t.id !== id);
    if (filtered.length === technicians.length) return false;

    localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured() && supabase) {
      supabase.from('tec_technicians').delete().eq('id', id);
    }

    return true;
  },

  getTECAgents(): TECAgent[] {
    try {
      const data = localStorage.getItem(TEC_AGENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTECAgent(agent: Omit<TECAgent, 'id' | 'created_at'>): TECAgent {
    const newAgent: TECAgent = {
      ...agent,
      id: `agent_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const agents = this.getTECAgents();
    agents.push(newAgent);
    localStorage.setItem(TEC_AGENTS_KEY, JSON.stringify(agents));

    return newAgent;
  },

  updateTECAgent(id: string, updates: Partial<TECAgent>): TECAgent | null {
    const agents = this.getTECAgents();
    const index = agents.findIndex(a => a.id === id);
    if (index === -1) return null;

    agents[index] = { ...agents[index], ...updates };
    localStorage.setItem(TEC_AGENTS_KEY, JSON.stringify(agents));

    return agents[index];
  },

  deleteTECAgent(id: string): boolean {
    const agents = this.getTECAgents();
    const filtered = agents.filter(a => a.id !== id);
    if (filtered.length === agents.length) return false;

    localStorage.setItem(TEC_AGENTS_KEY, JSON.stringify(filtered));
    return true;
  },
};

export default tecService;
