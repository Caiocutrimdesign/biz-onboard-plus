export interface GPSData {
  device_id: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  altitude: number;
  ignition: boolean;
  battery: number;
  signal: number;
  timestamp: Date;
  mileage: number;
  odometer: number;
  satellites: number;
  gsm: number;
}

export interface NormalizedGPSData {
  device_id: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  ignition: boolean;
  battery: number;
  timestamp: Date;
  raw_data?: any;
  protocol: string;
}

export interface Device {
  id: string;
  imei: string;
  model: string;
  protocol: 'TK103' | 'GT06' | 'TK309' | 'MEILIGAO' | 'XEXUN' | 'CONCOX';
  vehicle_id?: string;
  plate?: string;
  status: 'online' | 'offline' | 'alert';
  last_seen: Date;
  config: DeviceConfig;
}

export interface DeviceConfig {
  interval_upload: number;
  interval_alarm: number;
  geofences: string[];
  speed_limit: number;
  idle_timeout: number;
  commands_enabled: string[];
}

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon' | 'corridor';
  coordinates: GeofenceCoordinates;
  color: string;
  alert_on_entry: boolean;
  alert_on_exit: boolean;
  vehicle_ids: string[];
  active: boolean;
}

export interface GeofenceCoordinates {
  center?: { lat: number; lng: number };
  radius?: number;
  points?: { lat: number; lng: number }[];
  corridor_width?: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  vehicle_id: string;
  device_id: string;
  message: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
}

export type AlertType = 
  | 'speed_alarm'
  | 'geofence_entry'
  | 'geofence_exit'
  | 'ignition_on'
  | 'ignition_off'
  | 'sos'
  | 'low_battery'
  | 'power_cut'
  | 'tow_alert'
  | 'idle_alert'
  | 'speeding'
  | 'harsh_braking'
  | 'fuel_theft'
  | 'gps_jamming';

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  color: string;
  device_id: string;
  owner_id: string;
  status: 'active' | 'inactive' | 'alert';
  last_position?: NormalizedGPSData;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  speed: number;
  timestamp: Date;
  ignition: boolean;
}

export interface Route {
  id: string;
  vehicle_id: string;
  start_time: Date;
  end_time?: Date;
  points: RoutePoint[];
  distance: number;
  duration: number;
  max_speed: number;
  avg_speed: number;
  idle_time: number;
}

export interface BlockCommand {
  id: string;
  vehicle_id: string;
  device_id: string;
  type: 'block' | 'unblock' | 'cut_fuel';
  status: 'pending' | 'sent' | 'confirmed' | 'failed';
  sent_at?: Date;
  confirmed_at?: Date;
  safety_check: SafetyCheck;
  initiated_by: string;
  reason: string;
}

export interface SafetyCheck {
  speed_check: boolean;
  speed_at_request: number;
  ignition_check: boolean;
  ignition_status: boolean;
  safe_to_execute: boolean;
}

export interface FraudDetection {
  id: string;
  device_id: string;
  vehicle_id: string;
  type: FraudType;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: any;
  timestamp: Date;
  resolved: boolean;
}

export type FraudType = 
  | 'gps_teleport'
  | 'signal_duplication'
  | 'device_disconnect'
  | 'speed_impossible'
  | 'route_deviation';

export interface AnalyticsData {
  vehicle_id: string;
  period: { start: Date; end: Date };
  total_distance: number;
  total_time: number;
  moving_time: number;
  idle_time: number;
  max_speed: number;
  avg_speed: number;
  fuel_consumption_estimate: number;
  idle_events: number;
  speeding_events: number;
  harsh_braking_events: number;
}

export interface NotificationChannel {
  type: 'whatsapp' | 'sms' | 'push' | 'email';
  enabled: boolean;
  template?: string;
}

export interface UserPreferences {
  user_id: string;
  channels: NotificationChannel[];
  alert_types: AlertType[];
  quiet_hours: { start: string; end: string };
  geofence_notifications: boolean;
}

export interface StreamEvent {
  type: string;
  vehicle_id: string;
  device_id: string;
  data: any;
  timestamp: Date;
}
