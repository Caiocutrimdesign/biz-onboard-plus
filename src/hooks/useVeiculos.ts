import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Veiculo {
  id: string;
  id_remoto: string;
  placa: string;
  lat: number;
  lng: number;
  velocidade: number;
  ignicao: boolean;
  updated_at: string;
  status: 'ligado' | 'desligado' | 'removido'; // Mapear logicamente
}

export function useVeiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados iniciais
  useEffect(() => {
    async function fetchInitialData() {
      const { data, error } = await supabase
        .from('veiculos_tracking' as any)
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

    // Assinar mudanças em tempo real
    const channel = supabase
      .channel('veiculos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'veiculos_tracking' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newVeiculo = payload.new as any;
            setVeiculos(prev => [...prev, { ...newVeiculo, status: newVeiculo.ignicao ? 'ligado' : 'desligado' }]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setVeiculos(prev => prev.map(v => v.id_remoto === updated.id_remoto ? { ...updated, status: updated.ignicao ? 'ligado' : 'desligado' } : v));
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as any;
            setVeiculos(prev => prev.filter(v => v.id_remoto !== deleted.id_remoto));
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
