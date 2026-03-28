import { useState, useCallback, useEffect } from 'react';
import type { NormalizedGPSData, Device } from '@/gps-agents/types';

interface ProtocolParser {
  parse: (raw: string) => GPSRawData | null;
  validate: (data: GPSRawData) => boolean;
}

interface GPSRawData {
  imei: string;
  data: any;
  protocol: string;
}

interface CollectorConfig {
  protocol: 'TK103' | 'GT06' | 'TK309' | 'MEILIGAO' | 'XEXUN' | 'CONCOX';
  endpoint: string;
  port: number;
}

const TK103_PARSER: ProtocolParser = {
  parse: (raw: string) => {
    const match = raw.match(/^(?:ATP|ATO|ATV)(\d{15})(?:,(\d+),(\d+),)?(A\d{14},[^,]+,\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},[+-]?\d+\.\d+,[+-]?\d+\.\d+,\d+,\d+,\d{4}.*)/);
    if (!match) return null;
    
    return {
      imei: match[1],
      data: {
        command: match[1].slice(0, 3),
        latitude: parseFloat(match[3]) / 1000000,
        longitude: parseFloat(match[4]) / 1000000,
      },
      protocol: 'TK103',
    };
  },
  validate: (data) => !!data.imei && data.data.latitude && data.data.longitude,
};

const GT06_PARSER: ProtocolParser = {
  parse: (raw: string) => {
    const hexMatch = raw.match(/^(?:7878)(\d{2})(.*?)(0d0a)$/);
    if (!hexMatch) return null;
    
    const imeiMatch = raw.match(/IMEI:(\d{15})/);
    const locMatch = raw.match(/(\d{2})(\d{2})(\d{2})([+-]\d{8})([+-]\d{9})/);
    
    if (!imeiMatch || !locMatch) return null;
    
    const latDir = locMatch[4].slice(0, 1);
    const latVal = parseInt(locMatch[4].slice(1)) / 1000000;
    const lngDir = locMatch[5].slice(0, 1);
    const lngVal = parseInt(locMatch[5].slice(1)) / 1000000;
    
    return {
      imei: imeiMatch[1],
      data: {
        latitude: latDir === '+' ? latVal : -latVal,
        longitude: lngDir === '+' ? lngVal : -lngVal,
        speed: parseInt(locMatch[1]),
        time: locMatch[2] + locMatch[3] + locMatch[4].slice(0, 2) + locMatch[5].slice(0, 2),
      },
      protocol: 'GT06',
    };
  },
  validate: (data) => !!data.imei && Math.abs(data.data.latitude) <= 90,
};

const MEILIGAO_PARSER: ProtocolParser = {
  parse: (raw: string) => {
    const match = raw.match(/^##,(\d+),([^,]+),(\d+\.\d+),([+-]\d+\.\d+),(\d+),(\d+),(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}),([01]),(\d+)/);
    if (!match) return null;
    
    return {
      imei: match[1],
      data: {
        latitude: parseFloat(match[3]),
        longitude: parseFloat(match[4]),
        speed: parseInt(match[5]),
        heading: parseInt(match[6]),
        datetime: match[7],
        ignition: match[8] === '1',
        battery: parseInt(match[9]),
      },
      protocol: 'MEILIGAO',
    };
  },
  validate: (data) => !!data.imei && Math.abs(data.data.latitude) <= 90,
};

const DEFAULT_CONFIG: CollectorConfig = {
  protocol: 'TK103',
  endpoint: 'tracking.rastremix.com.br',
  port: 5013,
};

export function useCollectorAgent(config: CollectorConfig = DEFAULT_CONFIG) {
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [lastData, setLastData] = useState<NormalizedGPSData | null>(null);
  const [stats, setStats] = useState({
    packetsReceived: 0,
    packetsValid: 0,
    packetsInvalid: 0,
    lastPacketTime: null as Date | null,
  });

  const parsers: Record<string, ProtocolParser> = {
    TK103: TK103_PARSER,
    GT06: GT06_PARSER,
    MEILIGAO: MEILIGAO_PARSER,
  };

  const registerDevice = useCallback((imei: string, protocol: string) => {
    setDevices(prev => {
      const exists = prev.find(d => d.imei === imei);
      if (exists) return prev;
      
      return [...prev, {
        id: `dev-${imei}`,
        imei,
        model: 'GPS Tracker',
        protocol: protocol as any,
        status: 'online',
        last_seen: new Date(),
        config: {
          interval_upload: 30,
          interval_alarm: 10,
          geofences: [],
          speed_limit: 120,
          idle_timeout: 15,
          commands_enabled: ['location', 'block', 'unblock'],
        },
      }];
    });
  }, []);

  const processRawData = useCallback((raw: string, protocol: string = 'TK103'): NormalizedGPSData | null => {
    const parser = parsers[protocol];
    if (!parser) return null;

    const parsed = parser.parse(raw);
    if (!parsed || !parser.validate(parsed)) {
      setStats(prev => ({
        ...prev,
        packetsInvalid: prev.packetsInvalid + 1,
      }));
      return null;
    }

    setStats(prev => ({
      ...prev,
      packetsReceived: prev.packetsReceived + 1,
      packetsValid: prev.packetsValid + 1,
      lastPacketTime: new Date(),
    }));

    registerDevice(parsed.imei, parsed.protocol);

    const normalized: NormalizedGPSData = {
      device_id: parsed.imei,
      lat: parsed.data.latitude,
      lng: parsed.data.longitude,
      speed: parsed.data.speed || 0,
      heading: parsed.data.heading || 0,
      ignition: parsed.data.ignition ?? true,
      battery: parsed.data.battery ?? 100,
      timestamp: new Date(parsed.data.datetime || Date.now()),
      protocol: parsed.protocol,
      raw_data: parsed.data,
    };

    setLastData(normalized);
    return normalized;
  }, [registerDevice]);

  const connect = useCallback(async () => {
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const simulateData = useCallback((deviceId: string) => {
    const simulated: NormalizedGPSData = {
      device_id: deviceId,
      lat: -23.5505 + (Math.random() - 0.5) * 0.1,
      lng: -46.6333 + (Math.random() - 0.5) * 0.1,
      speed: Math.floor(Math.random() * 80),
      heading: Math.floor(Math.random() * 360),
      ignition: Math.random() > 0.3,
      battery: Math.floor(Math.random() * 100),
      timestamp: new Date(),
      protocol: 'SIMULATED',
    };

    setLastData(simulated);
    setStats(prev => ({
      ...prev,
      packetsReceived: prev.packetsReceived + 1,
      packetsValid: prev.packetsValid + 1,
      lastPacketTime: new Date(),
    }));

    return simulated;
  }, []);

  return {
    isConnected,
    devices,
    lastData,
    stats,
    connect,
    disconnect,
    processRawData,
    simulateData,
    registerDevice,
  };
}

export type { CollectorConfig, GPSRawData, ProtocolParser };
