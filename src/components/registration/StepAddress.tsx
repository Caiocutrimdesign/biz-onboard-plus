import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from '@/store/registrationStore';

interface Props { onNext: () => void; onBack: () => void; }

export function StepAddress({ onNext, onBack }: Props) {
  const { data, updateData } = useRegistrationStore();
  const canProceed = data.cep && data.street && data.number && data.neighborhood && data.city && data.state;

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mx-auto w-full max-w-lg space-y-6 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
        <div>
          <h2 className="font-display text-2xl font-bold">Endereço</h2>
          <p className="text-sm text-muted-foreground">Onde você mora?</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>CEP *</Label><Input placeholder="00000-000" value={data.cep || ''} onChange={(e) => updateData({ cep: e.target.value })} className="mt-1 h-12 text-base" /></div>
          <div><Label>Número *</Label><Input placeholder="123" value={data.number || ''} onChange={(e) => updateData({ number: e.target.value })} className="mt-1 h-12 text-base" /></div>
        </div>
        <div><Label>Rua *</Label><Input placeholder="Rua das Flores" value={data.street || ''} onChange={(e) => updateData({ street: e.target.value })} className="mt-1 h-12 text-base" /></div>
        <div><Label>Bairro *</Label><Input placeholder="Centro" value={data.neighborhood || ''} onChange={(e) => updateData({ neighborhood: e.target.value })} className="mt-1 h-12 text-base" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Cidade *</Label><Input placeholder="São Paulo" value={data.city || ''} onChange={(e) => updateData({ city: e.target.value })} className="mt-1 h-12 text-base" /></div>
          <div><Label>Estado *</Label><Input placeholder="SP" value={data.state || ''} onChange={(e) => updateData({ state: e.target.value })} className="mt-1 h-12 text-base" /></div>
        </div>
        <div><Label>Complemento</Label><Input placeholder="Apto 42" value={data.complement || ''} onChange={(e) => updateData({ complement: e.target.value })} className="mt-1 h-12 text-base" /></div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 text-base">Voltar</Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-gradient-brand h-12 flex-1 text-base font-semibold text-primary-foreground">Continuar</Button>
      </div>
    </motion.div>
  );
}
