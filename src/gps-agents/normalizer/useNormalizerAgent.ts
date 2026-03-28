import { useState, useCallback, useMemo } from 'react';
import type { NormalizedGPSData, GPSData } from '@/gps-agents/types';

interface NormalizerConfig {
  defaultSpeedLimit: number;
  minBatteryLevel: number;
  maxSpeed: number;
}

const DEFAULT_CONFIG: NormalizerConfig = {
  defaultSpeedLimit: 120,
  minBatteryLevel: 20,
  maxSpeed: 250,
};

export function useNormalizerAgent(config: NormalizerConfig = DEFAULT_CONFIG) {
  const [normalizedData, setNormalizedData] = useState<NormalizedGPSData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const normalize = useCallback((raw: any, protocol: string): NormalizedGPSData | null => {
    try {
      let normalized: NormalizedGPSData;

      switch (protocol) {
        case 'TK103':
          normalized = normalizeTK103(raw);
          break;
        case 'GT06':
          normalized = normalizeGT06(raw);
          break;
        case 'MEILIGAO':
          normalized = normalizeMEILIGAO(raw);
          break;
        case 'XEXUN':
          normalized = normalizeXEXUN(raw);
          break;
        case 'CONCOX':
          normalized = normalizeCONCOX(raw);
          break;
        default:
          normalized = normalizeGeneric(raw);
      }

      if (!validateNormalized(normalized)) {
        setErrors(prev => [...prev, `Validation failed for device: ${raw.imei}`]);
        return null;
      }

      normalized = applyCorrections(normalized);
      setNormalizedData(prev => [...prev.slice(-999), normalized]);
      return normalized;

    } catch (error) {
      setErrors(prev => [...prev, `Normalize error: ${error}`]);
      return null;
    }
  }, []);

  const normalizeTK103 = (raw: any): NormalizedGPSData => {
    const latRaw = raw.latitude || raw.lat || 0;
    const lngRaw = raw.longitude || raw.lng || 0;
    
    let lat = latRaw;
    let lng = lngRaw;
    
    if (latRaw > 90) {
      lat = Math.floor(latRaw / 100) + ((latRaw % 100) / 60);
    }
    if (lngRaw > 180) {
      lng = Math.floor(lngRaw / 100) + ((lngRaw % 100) / 60);
    }

    return {
      device_id: raw.imei || raw.device_id,
      lat,
      lng,
      speed: Math.min(raw.speed || 0, config.maxSpeed),
      heading: raw.heading || raw.direction || 0,
      ignition: raw.ignition ?? raw ACC_STATUS === 'ON' ?? true,
      battery: raw.battery ?? raw.volt ?? 100,
      timestamp: parseDate(raw.datetime || raw.time || raw.timestamp),
      protocol: 'TK103',
      raw_data: raw,
    };
  };

  const normalizeGT06 = (raw: any): NormalizedGPSData => {
    let lat = raw.latitude || 0;
    let lng = raw.longitude || 0;

    if (lat > 1000) {
      const latStr = String(lat);
      const latDir = latStr[0] === '-' ? -1 : 1;
      const latDeg = parseInt(latStr.slice(1, 3));
      const latMin = parseFloat(latStr.slice(3)) / 10000;
      lat = latDir * (latDeg + latMin / 60);
    }

    if (lng > 10000) {
      const lngStr = String(lng);
      const lngDir = lngStr[0] === '-' ? -1 : 1;
      const lngDeg = parseInt(lngStr.slice(1, 4));
      const lngMin = parseFloat(lngStr.slice(4)) / 10000;
      lng = lngDir * (lngDeg + lngMin / 60);
    }

    return {
      device_id: raw.imei || raw.device_id,
      lat,
      lng,
      speed: Math.min(raw.speed || 0, config.maxSpeed),
      heading: raw.heading || raw.course || 0,
      ignition: raw.ignition ?? true,
      battery: raw.battery ?? raw.power ?? 100,
      timestamp: parseDate(raw.time || raw.datetime || Date.now()),
      protocol: 'GT06',
      raw_data: raw,
    };
  };

  const normalizeMEILIGAO = (raw: any): NormalizedGPSData => ({
    device_id: raw.imei || raw.device_id,
    lat: parseFloat(raw.latitude) || 0,
    lng: parseFloat(raw.longitude) || 0,
    speed: Math.min(raw.speed || 0, config.maxSpeed),
    heading: raw.heading || raw.direction || 0,
    ignition: raw.ignition === '1' || raw.ignition === true,
    battery: parseInt(raw.battery) || 100,
    timestamp: parseDate(raw.datetime || raw.time || Date.now()),
    protocol: 'MEILIGAO',
    raw_data: raw,
  });

  const normalizeXEXUN = (raw: any): NormalizedGPSData => {
    const latMatch = String(raw.lat).match(/(\d+)(\d{2}\.\d+)/);
    const lngMatch = String(raw.lng).match(/(\d+)(\d{2}\.\d+)/);
    
    let lat = 0, lng = 0;
    
    if (latMatch) {
      lat = parseInt(latMatch[1]) + parseFloat(latMatch[2]) / 60;
      if (raw.lat_dir === 'S') lat = -lat;
    }
    
    if (lngMatch) {
      lng = parseInt(lngMatch[1]) + parseFloat(lngMatch[2]) / 60;
      if (raw.lng_dir === 'W') lng = -lng;
    }

    return {
      device_id: raw.imei || raw.device_id,
      lat,
      lng,
      speed: Math.min(raw.speed || 0, config.maxSpeed),
      heading: raw.heading || 0,
      ignition: raw.ignition ?? true,
      battery: raw.battery ?? 100,
      timestamp: parseDate(raw.datetime || Date.now()),
      protocol: 'XEXUN',
      raw_data: raw,
    };
  };

  const normalizeCONCOX = (raw: any): NormalizedGPSData => ({
    device_id: raw.imei || raw.device_id,
    lat: parseFloat(raw.latitude) || 0,
    lng: parseFloat(raw.longitude) || 0,
    speed: Math.min((raw.speed_kph || raw.speed) / 3.6 || 0, config.maxSpeed),
    heading: raw.heading || 0,
    ignition: raw.acc_status === 1 || raw.ignition,
    battery: raw.battery_percent ?? 100,
    timestamp: parseDate(raw.gps_time || raw.datetime || Date.now()),
    protocol: 'CONCOX',
    raw_data: raw,
  });

  const normalizeGeneric = (raw: any): NormalizedGPSData => ({
    device_id: raw.imei || raw.device_id || raw.id || String(Date.now()),
    lat: parseFloat(raw.lat) || parseFloat(raw.latitude) || parseFloat(raw.gps_lat) || 0,
    lng: parseFloat(raw.lng) || parseFloat(raw.lngitude) || parseFloat(raw.gps_lng) || 0,
    speed: Math.min(raw.speed || raw.velocity || 0, config.maxSpeed),
    heading: raw.heading || raw.direction || raw.course || 0,
    ignition: raw.ignition ?? raw.acc ?? true,
    battery: raw.battery ?? raw.power ?? 100,
    timestamp: parseDate(raw.timestamp || raw.time || raw.datetime || Date.now()),
    protocol: 'GENERIC',
    raw_data: raw,
  });

  const parseDate = (date: any): Date => {
    if (date instanceof Date) return date;
    if (typeof date === 'number') return new Date(date);
    
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) return parsed;
    
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
      /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
    ];
    
    for (const format of formats) {
      const match = String(date).match(format);
      if (match) {
        const [, y, m, d, h, min, s] = match;
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min), parseInt(s));
      }
    }
    
    return new Date();
  };

  const validateNormalized = (data: NormalizedGPSData): boolean => {
    if (!data.device_id) return false;
    if (Math.abs(data.lat) > 90) return false;
    if (Math.abs(data.lng) > 180) return false;
    if (data.speed < 0 || data.speed > config.maxSpeed) return false;
    if (isNaN(data.lat) || isNaN(data.lng)) return false;
    return true;
  };

  const applyCorrections = (data: NormalizedGPSData): NormalizedGPSData => {
    let corrected = { ...data };

    if (Math.abs(corrected.lat) < 0.01 && Math.abs(corrected.lng) < 0.01) {
      corrected.lat = 0;
      corrected.lng = 0;
    }

    if (corrected.speed > config.maxSpeed) {
      corrected.speed = config.maxSpeed;
    }

    if (corrected.speed < 0) {
      corrected.speed = 0;
    }

    if (corrected.battery < 0) {
      corrected.battery = 0;
    }
    if (corrected.battery > 100) {
      corrected.battery = 100;
    }

    return corrected;
  };

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const stats = useMemo(() => ({
    totalNormalized: normalizedData.length,
    errorsCount: errors.length,
    protocolsUsed: [...new Set(normalizedData.map(d => d.protocol))],
  }), [normalizedData, errors]);

  return {
    normalize,
    normalizedData,
    errors,
    clearErrors,
    stats,
  };
}

export type { NormalizerConfig };
