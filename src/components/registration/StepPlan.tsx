import { motion } from 'framer-motion';
import { Shield, Lock, Star, Truck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from '@/store/registrationStore';
import type { PlanType } from '@/types/customer';

const plans: { value: PlanType; title: string; price: string; icon: typeof Shield; features: string[] }[] = [
  {
    value: 'basico',
    title: 'Rastreamento Básico',
    price: 'R$ 49,90/mês',
    icon: Shield,
    features: ['Rastreamento 24h', 'App de acompanhamento', 'Histórico de rotas', 'Suporte por WhatsApp'],
  },
  {
    value: 'bloqueio',
    title: 'Rastreamento + Bloqueio',
    price: 'R$ 69,90/mês',
    icon: Lock,
    features: ['Tudo do Básico', 'Bloqueio remoto', 'Alerta de velocidade', 'Cerca virtual'],
  },
  {
    value: 'completo',
    title: 'Plano Completo',
    price: 'R$ 89,90/mês',
    icon: Star,
    features: ['Tudo do Bloqueio', 'Assistência 24h', 'Seguro contra furto', 'Instalação grátis'],
  },
  {
    value: 'frota',
    title: 'Proteção para Frota',
    price: 'Sob consulta',
    icon: Truck,
    features: ['Gestão de frota', 'Relatórios avançados', 'Dashboard gerencial', 'Suporte dedicado'],
  },
];

interface Props { onNext: () => void; onBack: () => void; }

export function StepPlan({ onNext, onBack }: Props) {
  const { data, updateData } = useRegistrationStore();

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mx-auto w-full max-w-2xl space-y-6 px-4">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-black">Escolha seu Plano</h2>
        <p className="mt-1 text-sm text-black/70">Selecione o plano ideal para sua necessidade</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const selected = data.plan === plan.value;
          return (
            <motion.button
              key={plan.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ plan: plan.value })}
              className={`relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all ${
                selected
                  ? 'border-primary bg-primary/5 shadow-brand'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {plan.value === 'completo' && (
                <span className="bg-gradient-to-r from-gray-300 to-gray-400 absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-bold text-black shadow-md">
                  POPULAR
                </span>
              )}
              <plan.icon className={`mb-3 h-8 w-8 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className="font-display text-lg font-bold text-black">{plan.title}</h3>
              <p className="mt-1 text-xl font-bold text-primary">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-black">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
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
