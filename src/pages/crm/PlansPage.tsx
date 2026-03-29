import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Key, MapPin, Users, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    id: 'basico',
    name: 'Rastreio Básico',
    price: 'R$ 49',
    period: '/mês',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Rastreamento em Tempo Real',
      'Alertas de Movimento',
      'App Mobile',
      'Cobertura Nacional',
    ],
    notIncluded: ['Alertas de Velocidade', 'Bloqueio Remoto', 'Relatórios Detalhados'],
  },
  {
    id: 'bloqueio',
    name: 'Rastreio + Bloqueio',
    price: 'R$ 79',
    period: '/mês',
    popular: true,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Rastreamento em Tempo Real',
      'Alertas de Movimento',
      'App Mobile',
      'Cobertura Nacional',
      'Alertas de Velocidade',
      'Bloqueio Remoto',
    ],
    notIncluded: ['Relatórios Detalhados'],
  },
  {
    id: 'completo',
    name: 'Rastreio Completo',
    price: 'R$ 129',
    period: '/mês',
    color: 'from-emerald-500 to-teal-500',
    features: [
      'Rastreamento em Tempo Real',
      'Alertas de Movimento',
      'App Mobile',
      'Cobertura Nacional',
      'Alertas de Velocidade',
      'Bloqueio Remoto',
      'Relatórios Detalhados',
      'Suporte 24h',
    ],
    notIncluded: [],
  },
  {
    id: 'frota',
    name: 'Plano Frota',
    price: 'Sob consulta',
    color: 'from-amber-500 to-orange-500',
    features: [
      'Gestão de Frota',
      'Veículos Ilimitados',
      'Relatórios Executivos',
      'Gerente Dedicado',
      'Geofencing',
      'Histórico de 1 Ano',
    ],
    notIncluded: [],
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>('bloqueio');

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-8">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold">Escolha o Plano Ideal</h1>
        <p className="mt-2 text-white/70 text-lg">
          Soluções completas de rastreamento veicular para proteger o que é seu.
        </p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-yellow-500 text-white px-3 py-1">Mais Popular</Badge>
                </div>
              )}
              
              <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${plan.color}`} />
              
              <div className="border rounded-b-2xl p-6 bg-card">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                
                <Button
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
                  className="w-full mt-4"
                >
                  {expanded === plan.id ? 'Ocultar' : 'Ver Detalhes'}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${expanded === plan.id ? 'rotate-180' : ''}`} />
                </Button>
                
                {expanded === plan.id && (
                  <div className="mt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 opacity-50">
                        <span className="w-4 h-4 text-center">✗</span>
                        <span className="text-sm line-through">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, label: 'Proteção Total', value: '24/7' },
            { icon: MapPin, label: 'Cobertura', value: 'Nacional' },
            { icon: Users, label: 'Suporte', value: 'Dedicado' },
          ].map((item) => (
            <div key={item.label} className="text-center p-6 rounded-2xl bg-muted/50">
              <item.icon className="w-10 h-10 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
