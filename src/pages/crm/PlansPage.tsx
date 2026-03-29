import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Car, Smartphone, MapPin, Bell, Key, 
  CheckCircle2, Star, Zap, Clock, Users, Globe,
  CreditCard, BarChart3, Phone, FileText, Headphones,
  ChevronRight, ChevronDown, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlanFeature {
  icon: React.ElementType;
  name: string;
  description: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  popular?: boolean;
  color: string;
  gradient: string;
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    id: 'basico',
    name: 'Rastreio Básico',
    tagline: 'Ideal para quem está começando',
    price: 'R$ 49',
    period: '/mês',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      { icon: MapPin, name: 'Rastreamento em Tempo Real', description: 'Acompanhe seu veículo 24h por dia', included: true },
      { icon: Shield, name: 'Alertas de Movimento', description: 'Notificação quando o veículo se mover', included: true },
      { icon: Smartphone, name: 'App Mobile', description: 'Acesse pelo celular ou computador', included: true },
      { icon: Globe, name: 'Cobertura Nacional', description: 'Funciona em todo o Brasil', included: true },
      { icon: Bell, name: 'Alertas de Velocidade', description: 'Saiba quando ultrapassar limites', included: false },
      { icon: Key, name: 'Bloqueio Remoto', description: 'Bloqueie o motor à distância', included: false },
      { icon: BarChart3, name: 'Relatórios Detalhados', description: 'Histórico de rotas e eventos', included: false },
      { icon: Headphones, name: 'Suporte 24h', description: 'Atendimento exclusivo', included: false },
    ],
  },
  {
    id: 'bloqueio',
    name: 'Rastreio + Bloqueio',
    tagline: 'Máxima segurança para seu veículo',
    price: 'R$ 79',
    period: '/mês',
    popular: true,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      { icon: MapPin, name: 'Rastreamento em Tempo Real', description: 'Acompanhe seu veículo 24h por dia', included: true },
      { icon: Shield, name: 'Alertas de Movimento', description: 'Notificação quando o veículo se mover', included: true },
      { icon: Smartphone, name: 'App Mobile', description: 'Acesse pelo celular ou computador', included: true },
      { icon: Globe, name: 'Cobertura Nacional', description: 'Funciona em todo o Brasil', included: true },
      { icon: Bell, name: 'Alertas de Velocidade', description: 'Saiba quando ultrapassar limites', included: true },
      { icon: Key, name: 'Bloqueio Remoto', description: 'Bloqueie o motor à distância', included: true },
      { icon: BarChart3, name: 'Relatórios Detalhados', description: 'Histórico de rotas e eventos', included: false },
      { icon: Headphones, name: 'Suporte 24h', description: 'Atendimento exclusivo', included: false },
    ],
  },
  {
    id: 'completo',
    name: 'Rastreio Completo',
    tagline: 'A solução completa para sua tranquilidade',
    price: 'R$ 129',
    period: '/mês',
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-500',
    features: [
      { icon: MapPin, name: 'Rastreamento em Tempo Real', description: 'Acompanhe seu veículo 24h por dia', included: true },
      { icon: Shield, name: 'Alertas de Movimento', description: 'Notificação quando o veículo se mover', included: true },
      { icon: Smartphone, name: 'App Mobile', description: 'Acesse pelo celular ou computador', included: true },
      { icon: Globe, name: 'Cobertura Nacional', description: 'Funciona em todo o Brasil', included: true },
      { icon: Bell, name: 'Alertas de Velocidade', description: 'Saiba quando ultrapassar limites', included: true },
      { icon: Key, name: 'Bloqueio Remoto', description: 'Bloqueie o motor à distância', included: true },
      { icon: BarChart3, name: 'Relatórios Detalhados', description: 'Histórico de rotas e eventos', included: true },
      { icon: Headphones, name: 'Suporte 24h', description: 'Atendimento exclusivo', included: true },
    ],
  },
  {
    id: 'frota',
    name: 'Plano Frota',
    tagline: 'Para empresas com múltiplos veículos',
    price: 'Sob consulta',
    period: '',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500',
    features: [
      { icon: Users, name: 'Gestão de Frota', description: 'Controle todos os veículos em um lugar', included: true },
      { icon: Car, name: 'Veículos Ilimitados', description: 'Quantos veículos precisar', included: true },
      { icon: BarChart3, name: 'Relatórios Executivos', description: 'Dashboards e análises', included: true },
      { icon: FileText, name: 'Relatórios Personalizados', description: 'Crie relatórios sob medida', included: true },
      { icon: Phone, name: 'Gerente Dedicado', description: 'Suporte exclusivo para sua empresa', included: true },
      { icon: Globe, name: 'Geofencing', description: 'Crie cercas virtuais', included: true },
      { icon: Clock, name: 'Histórico de 1 Ano', description: 'Dados guardados por mais tempo', included: true },
      { icon: Star, name: 'Benefícios Exclusivos', description: 'Vantagens para clientes empresariais', included: true },
    ],
  },
];

function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function PlanCard({ plan, expanded, onToggle }: { plan: Plan; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none px-4 py-1 shadow-lg">
            <Star className="w-3 h-3 mr-1" /> Mais Popular
          </Badge>
        </div>
      )}
      
      <Card className={`relative overflow-hidden border-2 ${plan.popular ? 'border-primary shadow-xl' : 'border-border/50'} bg-card`}>
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.popular ? 'from-primary via-primary to-primary' : plan.gradient}`} />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className={`font-display text-2xl font-black ${plan.color}`}>
                {plan.name}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{plan.tagline}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
              {plan.id === 'frota' ? (
                <Users className="w-7 h-7 text-white" />
              ) : plan.id === 'completo' ? (
                <Shield className="w-7 h-7 text-white" />
              ) : plan.id === 'bloqueio' ? (
                <Key className="w-7 h-7 text-white" />
              ) : (
                <MapPin className="w-7 h-7 text-white" />
              )}
            </div>
          </div>
          
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-4xl font-black">{plan.price}</span>
            {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button 
            onClick={onToggle}
            variant={plan.popular ? 'default' : 'outline'}
            className={`w-full h-12 rounded-xl font-bold ${plan.popular ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90' : ''}`}
          >
            {expanded ? (
              <>
                <ChevronDown className="w-5 h-5 mr-2" />
                Ocultar Detalhes
              </>
            ) : (
              <>
                <ChevronRight className="w-5 h-5 mr-2" />
                Ver Todos os Recursos
              </>
            )}
          </Button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 pt-4 overflow-hidden"
              >
                {plan.features.map((feature, idx) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-start gap-3 p-3 rounded-xl ${feature.included ? 'bg-muted/50' : 'bg-destructive/5'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.included ? 'bg-primary/10' : 'bg-muted'}`}>
                      <feature.icon className={`w-5 h-5 ${feature.included ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${feature.included ? '' : 'text-muted-foreground line-through'}`}>
                          {feature.name}
                        </p>
                        {feature.included ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PlansPage() {
  const [expandedPlan, setExpandedPlan] = useState<string | null>('bloqueio');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-8 text-white mx-6 mt-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="absolute top-0 left-0 text-white hover:bg-white/10 h-10 px-3"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3 mb-2 pt-10">
            <motion.div
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CreditCard className="w-5 h-5" />
            </motion.div>
            <span className="text-white/60 text-sm font-medium">Nossos Planos</span>
          </div>
          <h1 className="font-display text-4xl font-black mb-2">
            Escolha o Plano Ideal
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Soluções completas de rastreamento veicular para proteger o que é seu. 
            Do básico ao completo, temos o plano perfeito para você.
          </p>

          <div className="flex items-center gap-6 mt-8">
            {[
              { icon: Shield, label: 'Proteção Total', value: '24/7' },
              { icon: Globe, label: 'Cobertura', value: 'Nacional' },
              { icon: Headphones, label: 'Suporte', value: 'Dedicado' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <s.icon className="w-5 h-5 text-white/70" />
                <div>
                  <p className="text-lg font-black">{s.value}</p>
                  <p className="text-xs text-white/60">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            expanded={expandedPlan === plan.id}
            onToggle={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 p-8 mx-6 mb-6 border border-border/50"
      >
        <h2 className="font-display text-2xl font-black mb-6 flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          Perguntas Frequentes
        </h2>
        
        <div className="space-y-4">
          {[
            {
              q: 'Como funciona a instalação?',
              a: 'Nossa equipe técnica vai até você! A instalação é rápida e discreta, feita por profissionais especializados em até 2 horas.'
            },
            {
              q: 'Posso mudar de plano depois?',
              a: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento, sem burocracia.'
            },
            {
              q: 'O equipamento tem garantia?',
              a: 'Todos os equipamentos possuem 1 ano de garantia total. Após isso, oferecemos suporte técnico permanente.'
            },
            {
              q: 'Funciona em todo o Brasil?',
              a: 'Sim! Nossa cobertura é nacional. Você pode rastrear seu veículo em qualquer lugar do Brasil com sinal de celular.'
            },
            {
              q: 'O bloqueio danifica o veículo?',
              a: 'Não! O bloqueio é feito eletronicamente, sem nenhuma intervenção mecânica. Não há risco de danos ao motor ou outros sistemas do veículo.'
            },
            {
              q: 'Posso rastrear pelo celular?',
              a: 'Sim! Você recebe um aplicativo gratuito para iOS e Android. Nele você acompanha a localização do seu veículo em tempo real, recebe alertas e pode até bloquear o motor à distância.'
            },
          ].map((faq, i) => (
            <details key={i} className="group p-4 rounded-2xl bg-card border border-border/50">
              <summary className="flex items-center justify-between cursor-pointer font-semibold list-none">
                {faq.q}
                <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
