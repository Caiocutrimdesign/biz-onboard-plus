import { motion } from 'framer-motion';
import { User, Check, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRegistrationStore } from '@/store/registrationStore';
import { crmService } from '@/lib/crmService';
import { useState, useEffect } from 'react';
import type { Technician } from '@/types/tec';

interface Props { onNext: () => void; onBack: () => void; }

export function StepTechnician({ onNext, onBack }: Props) {
  const { data, updateData } = useRegistrationStore();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      const techs = await crmService.getTecnicos();
      setTechnicians((techs || []).map((t: any) => ({
        ...t,
        status: t.status || 'active'
      })).filter(t => t.status !== 'inactive'));
    } catch (e) {
      console.error('Erro ao carregar técnicos:', e);
    }
    setLoading(false);
  };

  const selectedTec = technicians.find(t => t.id === data.technician_id);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 40 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -40 }} 
      className="mx-auto w-full max-w-2xl space-y-6 px-4"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-black">Escolha o Técnico</h2>
        <p className="mt-1 text-sm text-black/70">Selecione o técnico responsável pela instalação</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando técnicos...</p>
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-8">
          <Wrench className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">Nenhum técnico disponível</p>
          <p className="text-sm text-muted-foreground">O cliente será direcionado automaticamente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {technicians.map((tec) => {
            const selected = data.technician_id === tec.id;
            return (
              <motion.button
                key={tec.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  updateData({ 
                    technician_id: tec.id,
                    technician_name: tec.name 
                  });
                }}
                className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                  selected
                    ? 'border-primary bg-primary/5 shadow-brand'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  selected ? 'bg-primary text-white' : 'bg-muted'
                }`}>
                  <User className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-black">{tec.name}</h3>
                  {tec.phone && (
                    <p className="text-sm text-muted-foreground">{tec.phone}</p>
                  )}
                </div>
                {selected && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {selectedTec && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            <Check className="w-4 h-4 inline mr-1" />
            Técnico <strong>{selectedTec.name}</strong> selecionado para o serviço
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 text-base">Voltar</Button>
        <Button 
          onClick={onNext} 
          className="bg-gradient-brand h-12 flex-1 text-base font-semibold text-primary-foreground"
        >
          {data.technician_id ? 'Confirmar e Continuar' : 'Pular (Escolher depois)'}
        </Button>
      </div>
    </motion.div>
  );
}
