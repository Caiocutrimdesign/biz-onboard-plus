import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Veiculo {
  id: string;
  id_rastremix: string;
  placa: string;
  latitude: number;
  longitude: number;
  velocidade: number;
  ignicao: boolean;
  ultima_atualizacao: string;
  status: 'ligado' | 'desligado'; 
}

export function useVeiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados iniciais de frota_veiculos
  useEffect(() => {
    async function fetchInitialData() {
      const { data, error } = await supabase
        .from('frota_veiculos' as any)
        .select('*')
        .order('placa', { ascending: true });

      if (!error && data) {
        setVeiculos((data as any[]).map(v => ({
          ...v,
          status: v.ignicao ? 'ligado' : 'desligado'
        })));
      }
      setIsLoading(false);
    }

    fetchInitialData();

    // Assinar mudanças em tempo real na nova tabela com ID Único para evitar colisões
    const channelId = `frota-realtime-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'frota_veiculos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newVeiculo = payload.new as any;
            setVeiculos(prev => [...prev, { ...newVeiculo, status: newVeiculo.ignicao ? 'ligado' : 'desligado' }]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setVeiculos(prev => prev.map(v => v.id_rastremix === updated.id_rastremix ? { ...updated, status: updated.ignicao ? 'ligado' : 'desligado' } : v));
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as any;
            setVeiculos(prev => prev.filter(v => v.id_rastremix !== deleted.id_rastremix));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    return {
      ligados: veiculos.filter(v => v.ignicao).length,
      desligados: veiculos.filter(v => !v.ignicao).length,
      total: veiculos.length
    };
  }, [veiculos]);

  return { veiculos, stats, isLoading };
}
