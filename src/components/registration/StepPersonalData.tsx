import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from '@/store/registrationStore';

interface Props { onNext: () => void; onBack: () => void; }

function formatCPF_CNPJ(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/g, '($1) $2-$3');
  } else {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/g, '($1) $2-$3');
  }
}

export function StepPersonalData({ onNext, onBack }: Props) {
  const { data, updateData } = useRegistrationStore();

  const canProceed = data.full_name && data.phone && data.cpf_cnpj && data.email;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="mx-auto w-full max-w-lg space-y-6 px-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Seus Dados</h2>
          <p className="text-sm text-muted-foreground">Precisamos de algumas informações básicas</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Nome completo *</Label>
          <Input id="full_name" placeholder="João da Silva" value={data.full_name || ''} onChange={(e) => updateData({ full_name: e.target.value })} className="mt-1 h-12 text-base" />
        </div>
        <div>
          <Label htmlFor="phone">Telefone / WhatsApp *</Label>
          <Input id="phone" placeholder="(11) 99999-9999" value={data.phone || ''} onChange={(e) => updateData({ phone: formatPhone(e.target.value) })} className="mt-1 h-12 text-base" />
        </div>
        <div>
          <Label htmlFor="cpf_cnpj">CPF ou CNPJ *</Label>
          <Input id="cpf_cnpj" placeholder="000.000.000-00" value={data.cpf_cnpj || ''} onChange={(e) => updateData({ cpf_cnpj: formatCPF_CNPJ(e.target.value) })} className="mt-1 h-12 text-base" maxLength={18} />
        </div>
        <div>
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" type="email" placeholder="joao@email.com" value={data.email || ''} onChange={(e) => updateData({ email: e.target.value })} className="mt-1 h-12 text-base" />
        </div>
        <div>
          <Label htmlFor="birth_date">Data de nascimento (opcional)</Label>
          <Input id="birth_date" type="date" value={data.birth_date || ''} onChange={(e) => updateData({ birth_date: e.target.value })} className="mt-1 h-12 text-base" />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 text-base">Voltar</Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-gradient-brand h-12 flex-1 text-base font-semibold text-primary-foreground">Continuar</Button>
      </div>
    </motion.div>
  );
}
