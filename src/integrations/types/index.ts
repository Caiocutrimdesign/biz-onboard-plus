export interface WeSalesConfig {
  apiKey: string;
  apiUrl: string;
  webhookSecret?: string;
  autoSync: boolean;
  syncInterval: number;
}

export interface WeSalesLead {
  id?: string;
  external_id?: string;
  name: string;
  email?: string;
  phone: string;
  document?: string;
  company?: string;
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  custom_fields?: Record<string, any>;
  tags?: string[];
  source?: string;
  owner_email?: string;
  status?: string;
  pipeline_id?: string;
  stage_id?: string;
  notes?: string;
}

export interface WeSalesDeal {
  id?: string;
  external_id?: string;
  title: string;
  value: number;
  contact_id?: string;
  pipeline_id?: string;
  stage_id?: string;
  owner_email?: string;
  expected_close_date?: string;
  custom_fields?: Record<string, any>;
  notes?: string;
}

export interface WeSalesCustomer {
  id?: string;
  external_id?: string;
  name: string;
  email?: string;
  phone: string;
  document?: string;
  company?: string;
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  vehicles?: WeSalesVehicle[];
  plan?: string;
  payment_method?: string;
}

export interface WeSalesVehicle {
  id?: string;
  plate: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
  type?: string;
  renavam?: string;
  chassis?: string;
}

export interface SyncResult {
  success: boolean;
  weSalesId?: string;
  externalId?: string;
  error?: string;
  syncedAt: Date;
}

export interface SyncLog {
  id: string;
  type: 'customer' | 'lead' | 'deal';
  externalId: string;
  weSalesId?: string;
  status: 'pending' | 'synced' | 'failed' | 'updated';
  attempts: number;
  lastAttempt: Date;
  error?: string;
  data: any;
}

export interface WebhookPayload {
  event: 'customer.created' | 'customer.updated' | 'lead.created' | 'lead.updated' | 'deal.created' | 'deal.updated';
  data: any;
  timestamp: string;
  signature?: string;
}

export interface WeSalesPipeline {
  id: string;
  name: string;
  stages: WeSalesStage[];
}

export interface WeSalesStage {
  id: string;
  name: string;
  order: number;
  probability?: number;
}

export interface WeSalesUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface WeSalesCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'email' | 'phone' | 'document';
  options?: string[];
  required: boolean;
}

export const DEFAULT_CONFIG: WeSalesConfig = {
  apiKey: '',
  apiUrl: 'https://api.wesales.com.br/v1',
  autoSync: true,
  syncInterval: 60000,
};

export const FIELD_MAPPING = {
  customer: {
    name: 'name',
    email: 'email',
    phone: 'phone',
    document: 'document',
    company: 'company',
  },
  vehicle: {
    plate: 'license_plate',
    brand: 'vehicle_brand',
    model: 'vehicle_model',
    year: 'vehicle_year',
    color: 'vehicle_color',
    type: 'vehicle_type',
    renavam: 'vehicle_renavam',
    chassis: 'vehicle_chassis',
  },
  address: {
    street: 'street',
    number: 'address_number',
    neighborhood: 'neighborhood',
    city: 'city',
    state: 'state',
    zip_code: 'zip_code',
  },
};
