import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from '@/store/registrationStore';

interface Props { onNext: () => void; onBack: () => void; }

export function StepNotes({ onNext, onBack }: Props) {
  const { data, updateData } = useRegistrationStore();

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mx-auto w-full max-w-lg space-y-6 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><MessageSquare className="h-5 w-5 text-primary" /></div>
        <div>
          <h2 className="font-display text-2xl font-bold">Observações</h2>
          <p className="text-sm text-muted-foreground">Algo mais que devemos saber?</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Observações adicionais</Label>
          <Textarea placeholder="Conte-nos suas necessidades específicas..." value={data.notes || ''} onChange={(e) => updateData({ notes: e.target.value })} className="mt-1 min-h-[120px] text-base" />
        </div>
        <div>
          <Label>Melhor horário para contato</Label>
          <Input placeholder="Ex: Manhã, das 9h às 12h" value={data.preferred_contact_time || ''} onChange={(e) => updateData({ preferred_contact_time: e.target.value })} className="mt-1 h-12 text-base" />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 text-base">Voltar</Button>
        <Button onClick={onNext} className="bg-gradient-brand h-12 flex-1 text-base font-semibold text-primary-foreground">Enviar Cadastro</Button>
      </div>
    </motion.div>
  );
}
