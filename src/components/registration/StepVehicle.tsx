import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from '@/store/registrationStore';
import type { VehicleType } from '@/types/customer';

const vehicleTypes: { value: VehicleType; label: string; emoji: string }[] = [
  { value: 'carro', label: 'Carro', emoji: '🚗' },
  { value: 'moto', label: 'Moto', emoji: '🏍️' },
  { value: 'caminhao', label: 'Caminhão', emoji: '🚛' },
  { value: 'frota', label: 'Frota', emoji: '🚐' },
];

interface Props { onNext: () => void; onBack: () => void; }

export function StepVehicle({ onNext, onBack }: Props) {
  const { data, updateData } = useRegistrationStore();
  const canProceed = data.vehicle_type && data.plate && data.brand && data.model && data.year && data.color;

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mx-auto w-full max-w-lg space-y-6 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Car className="h-5 w-5 text-primary" /></div>
        <div>
          <h2 className="font-display text-2xl font-bold">Seu Veículo</h2>
          <p className="text-sm text-muted-foreground">Informações do veículo que será protegido</p>
        </div>
      </div>

      <div>
        <Label>Tipo de veículo *</Label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {vehicleTypes.map((vt) => (
            <button
              key={vt.value}
              onClick={() => updateData({ vehicle_type: vt.value })}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                data.vehicle_type === vt.value
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              <span className="text-2xl">{vt.emoji}</span>
              {vt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Placa *</Label><Input placeholder="ABC-1234" value={data.plate || ''} onChange={(e) => updateData({ plate: e.target.value })} className="mt-1 h-12 text-base" /></div>
          <div><Label>Ano *</Label><Input placeholder="2024" value={data.year || ''} onChange={(e) => updateData({ year: e.target.value })} className="mt-1 h-12 text-base" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Marca *</Label><Input placeholder="Volkswagen" value={data.brand || ''} onChange={(e) => updateData({ brand: e.target.value })} className="mt-1 h-12 text-base" /></div>
          <div><Label>Modelo *</Label><Input placeholder="Gol" value={data.model || ''} onChange={(e) => updateData({ model: e.target.value })} className="mt-1 h-12 text-base" /></div>
        </div>
        <div><Label>Cor *</Label><Input placeholder="Prata" value={data.color || ''} onChange={(e) => updateData({ color: e.target.value })} className="mt-1 h-12 text-base" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Renavam (opcional)</Label><Input value={data.renavam || ''} onChange={(e) => updateData({ renavam: e.target.value })} className="mt-1 h-12 text-base" /></div>
          <div><Label>Chassi (opcional)</Label><Input value={data.chassi || ''} onChange={(e) => updateData({ chassi: e.target.value })} className="mt-1 h-12 text-base" /></div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 text-base">Voltar</Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-gradient-brand h-12 flex-1 text-base font-semibold text-primary-foreground">Continuar</Button>
      </div>
    </motion.div>
  );
}
