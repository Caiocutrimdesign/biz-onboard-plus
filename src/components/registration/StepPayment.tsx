import { motion } from 'framer-motion';
import { CreditCard, QrCode, FileText, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from '@/store/registrationStore';
import type { PaymentMethod } from '@/types/customer';

const methods: { value: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { value: 'pix', label: 'Pix', icon: QrCode, desc: 'Pagamento instantâneo' },
  { value: 'cartao', label: 'Cartão', icon: CreditCard, desc: 'Crédito ou débito' },
  { value: 'boleto', label: 'Boleto', icon: FileText, desc: 'Vencimento em 3 dias' },
  { value: 'recorrente', label: 'Recorrente', icon: RefreshCw, desc: 'Débito automático mensal' },
  { value: 'conversar', label: 'Quero conversar', icon: MessageCircle, desc: 'Falar com atendente' },
];

interface Props { onNext: () => void; onBack: () => void; }

export function StepPayment({ onNext, onBack }: Props) {
  const { data, updateData } = useRegistrationStore();

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mx-auto w-full max-w-lg space-y-6 px-4">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold">Forma de Pagamento</h2>
        <p className="mt-1 text-sm text-muted-foreground">Como você prefere pagar?</p>
      </div>

      <div className="space-y-3">
        {methods.map((m) => {
          const selected = data.payment_method === m.value;
          return (
            <motion.button
              key={m.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ payment_method: m.value })}
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <m.icon className={`h-6 w-6 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-semibold">{m.label}</p>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 text-base">Voltar</Button>
        <Button onClick={onNext} className="bg-gradient-brand h-12 flex-1 text-base font-semibold text-primary-foreground">Continuar</Button>
      </div>
    </motion.div>
  );
}
