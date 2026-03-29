import { supabase, isSupabaseConfigured } from './supabase';
import type { Service, Technician, TECAgent, ServicePhoto, PhotoType } from '@/types/tec';

const SERVICES_KEY = 'tec_services';
const TECHNICIANS_KEY = 'tec_technicians';
const TEC_AGENTS_KEY = 'tec_agents';
const PHOTOS_KEY = 'tec_photos';

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
          ...newService,
          photos: undefined,
        })
        .select()
        .single();

      if (error) throw error;

      if (newService.photos?.length) {
        await this.savePhotos(newService.id, newService.photos);
      }

      return { ...newService, id: data.id };
    }

    const services = this.getServices();
    services.unshift(newService);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));

    if (newService.photos?.length) {
      this.savePhotosLocal(newService.id, newService.photos);
    }

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
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('tec_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const services = data || [];
      return Promise.all(
        services.map(async (s: any) => ({
          ...s,
          photos: await this.getPhotosFromDB(s.id),
        }))
      );
    }

    return this.getServices();
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
    const servicePhotos: ServicePhoto[] = photos.map(p => ({
      ...p,
      id: `photo_${Date.now()}_${Math.random()}`,
      service_id: serviceId,
      created_at: new Date().toISOString(),
    }));
    allPhotos[serviceId] = servicePhotos;
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(allPhotos));
  },

  async savePhotos(serviceId: string, photos: Omit<ServicePhoto, 'id' | 'service_id' | 'created_at'>[]) {
    if (!isSupabaseConfigured() || !supabase) {
      this.savePhotosLocal(serviceId, photos);
      return;
    }

    const photosToSave = photos.map(p => ({
      ...p,
      service_id: serviceId,
    }));

    const { error } = await supabase.from('tec_service_photos').insert(photosToSave);
    if (error) console.error('Error saving photos:', error);
  },

  getPhotos(serviceId: string): ServicePhoto[] {
    const allPhotos = JSON.parse(localStorage.getItem(PHOTOS_KEY) || '{}');
    return allPhotos[serviceId] || [];
  },

  async getPhotosFromDB(serviceId: string): Promise<ServicePhoto[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return this.getPhotos(serviceId);
    }

    const { data, error } = await supabase
      .from('tec_service_photos')
      .select('*')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: true });

    if (error) return this.getPhotos(serviceId);
    return data || [];
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
        .getPublicUrl(data.Key);

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
