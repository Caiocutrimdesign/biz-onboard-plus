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
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mx-auto w-full max-w-2xl space-y-8 px-4 pb-12">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white tracking-tight">Escolha seu Plano</h2>
        <p className="mt-2 text-sm text-white/50">Selecione a proteção ideal para seu veículo</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const selected = data.plan === plan.value;
          return (
            <motion.button
              key={plan.value}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ plan: plan.value })}
              className={`relative flex flex-col rounded-3xl p-6 text-left transition-all duration-300 ${
                selected
                  ? 'bg-primary/20 border-2 border-primary shadow-brand ring-1 ring-primary/50'
                  : 'bg-white/5 border-2 border-white/5 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {plan.value === 'completo' && (
                <span className="bg-primary absolute -top-3 right-4 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-lg uppercase tracking-wider">
                  MAIS VENDIDO
                </span>
              )}
              <div className={`mb-4 p-3 rounded-2xl w-fit ${selected ? 'bg-primary/20' : 'bg-white/5'}`}>
                <plan.icon className={`h-6 w-6 ${selected ? 'text-primary' : 'text-white/40'}`} />
              </div>
              <h3 className="font-display text-lg font-bold text-white">{plan.title}</h3>
              <p className="mt-1 text-2xl font-display font-bold text-primary">{plan.price}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className={`h-4 w-4 ${selected ? 'text-primary' : 'text-white/30'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              {selected && (
                <div className="absolute top-4 right-4 h-6 w-6 bg-primary rounded-full flex items-center justify-center animate-enter">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onBack} size="lg" className="flex-1">Voltar</Button>
        <Button variant="premium" onClick={onNext} disabled={!data.plan} size="lg" className="flex-1">Continuar</Button>
      </div>
    </motion.div>
  );
}
