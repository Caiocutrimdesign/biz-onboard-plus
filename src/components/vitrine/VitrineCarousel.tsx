import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, MapPin, Zap, BarChart3, Users, Car, Bell, Check, 
  ArrowRight, X, ChevronRight, Phone, Video, MessageCircle,
  Lock, Eye, Globe, Clock, AlertTriangle, CheckCircle2,
  Target, Key, FileText, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo3D } from '@/components/ui/Logo3D';
import { LogosCarousel } from '@/components/ui/LogosCarousel';

const slides = [
  {
    id: 'welcome',
    title: 'Proteção Total',
    subtitle: 'Para Seu Veículo',
    description: 'Sistema completo de rastreamento e proteção veicular. Sua tranquilidade é nossa prioridade 24 horas por dia.',
    gradient: 'from-orange-600 via-red-600 to-pink-600',
    features: ['Monitoramento 24h', 'Alertas em Tempo Real', 'Bloqueio Imediato'],
    stats: [
      { icon: Eye, label: 'Monitoramento', value: '24/7' },
      { icon: Shield, label: 'Proteção', value: '100%' },
      { icon: CheckCircle2, label: 'Tranquilidade', value: 'Garantida' },
    ],
    faqs: [
      { q: 'O que é proteção veicular?', a: 'É um serviço de monitoramento e rastreamento que protege seu veículo 24 horas por dia. Em caso de roubo ou furto, nossa equipe especializadas aciona as autoridades e bloqueia o veículo remotamente.' },
      { q: 'Quanto tempo demora a instalação?', a: 'A instalação é rápida e profissional. Em média, leva de 1 a 2 horas. Nossa equipe técnica vai até você no local de sua preferência.' },
      { q: 'O equipamento funciona em todo o Brasil?', a: 'Sim! Nossa cobertura é 100% nacional. Você pode rastrear seu veículo em qualquer lugar do Brasil onde haja sinal de celular.' },
      { q: 'Posso rastrear pelo celular?', a: 'Sim! Você recebe um aplicativo gratuito para iOS e Android. Nele você acompanha a localização do seu veículo em tempo real, recebe alertas e pode até bloquear o motor à distância.' },
    ],
    benefits: ['Cobertura em todo o Brasil', 'App para iOS e Android', 'Equipe SOC 24h', 'Instalação profissional'],
  },
  {
    id: 'tracking',
    title: 'Rastreie',
    subtitle: 'em Tempo Real',
    description: 'Acompanhe cada movimento do seu veículo com GPS de última geração. Precisão de metros, cobertura em todo o Brasil.',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    features: ['GPS de Alta Precisão', 'Cobertura Nacional', 'Atualizações ao Vivo'],
    stats: [
      { icon: MapPin, label: 'Precisão', value: '±2m' },
      { icon: Globe, label: 'Cobertura', value: '100% BR' },
      { icon: Clock, label: 'Atualização', value: '10s' },
    ],
    faqs: [
      { q: 'Como funciona o rastreamento?', a: 'O equipamento GPS instalado no veículo envia sinais de localização via rede celular. Você acompanha tudo pelo aplicativo ou painel web em tempo real.' },
      { q: 'A localização é atualizada em tempo real?', a: 'Sim! As coordenadas são atualizadas constantemente. Você vê o veículo se mover no mapa em tempo real, com precisão de metros.' },
      { q: 'Posso ver o histórico de rotas?', a: 'Sim! Você tem acesso ao histórico completo de todas as viagens do veículo, com data, hora, velocidade e rotas percorridas. Dados mantidos por até 90 dias.' },
      { q: 'O rastreamento funciona em local fechado?', a: 'Sim! O equipamento possui antenas de alta sensibilidade que captam sinais mesmo em estacionamentos subterrâneos e garagens fechadas.' },
    ],
    benefits: ['Localização em tempo real', 'Histórico de 90 dias', 'Precisão de metros', 'Funciona em local fechado'],
  },
  {
    id: 'security',
    title: 'Bloqueio',
    subtitle: 'Instantâneo',
    description: 'Em caso de emergência, bloqueie o motor do seu veículo à distância. Proteção que age em segundos para sua segurança.',
    gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    features: ['Bloqueio Remoto', 'Alerta de Emergência', 'Central 24h'],
    stats: [
      { icon: Zap, label: 'Tempo de Bloqueio', value: '< 30s' },
      { icon: Shield, label: 'SOC', value: '24 horas' },
      { icon: Check, label: 'Sem Danos', value: 'Garantido' },
    ],
    faqs: [
      { q: 'Como funciona o bloqueio remoto?', a: 'Em caso de roubo ou furto, você aciona o bloqueio pelo app ou liga para nossa central 24h. O motor do veículo é cortado em até 30 segundos, immobilizando o carro em local seguro.' },
      { q: 'O bloqueio danifica o veículo?', a: 'Não! O bloqueio é feito eletronicamente, sem nenhuma intervenção mecânica. Não há risco de danos ao motor ou outros sistemas do veículo.' },
      { q: 'E se o veículo estiver em movimento?', a: 'O sistema corta o combustível ou injeção eletrônica de forma segura. O veículo reduz a velocidade gradualmente até parar, evitando acidentes.' },
      { q: 'O que é o SOC 24h?', a: 'É nosso Centro de Operações de Segurança, com equipe especializada 24 horas por dia, 7 dias por semana. Em caso de emergência, você tem suporte imediato.' },
    ],
    benefits: ['Bloqueio em até 30 segundos', 'SOC 24h especializado', 'Sem danos ao veículo', 'Corte seguro do motor'],
  },
  {
    id: 'analytics',
    title: 'Relatórios',
    subtitle: 'Completos',
    description: 'Acesse todos os dados do seu veículo: rotas, velocidades, alertas e muito mais. Informações detalhadas ao seu alcance.',
    gradient: 'from-emerald-600 via-green-600 to-lime-600',
    features: ['Dados em Tempo Real', 'Relatórios PDF', 'Análises Detalhadas'],
    stats: [
      { icon: FileText, label: 'Relatórios', value: 'PDF/Excel' },
      { icon: Users, label: 'Usuários', value: 'até 5' },
      { icon: Target, label: 'Geofencing', value: 'Disponível' },
    ],
    faqs: [
      { q: 'Que tipo de relatórios posso gerar?', a: 'Você pode gerar relatórios detalhados de uso do veículo, rotas percorridas, velocidades, tempos de uso, consumo e muito mais. Tudo exportável em PDF e Excel.' },
      { q: 'Posso adicionar outros usuários?', a: 'Sim! Você pode cadastrar até 5 usuários por veículo, cada um com diferentes níveis de acesso: rastreamento, bloqueio ou apenas visualização.' },
      { q: 'O sistema gera alertas automáticos?', a: 'Sim! Você recebe alertas por push, SMS ou e-mail quando: veículo sair de uma área definida, ultrapassar velocidade limite, ou qualquer movimento não autorizado.' },
      { q: 'Posso configurar cercas geográficas?', a: 'Sim! Você define zonas de segurança no mapa. Se o veículo sair dessas áreas, você é alertado imediatamente pelo aplicativo.' },
    ],
    benefits: ['Relatórios em PDF', 'Até 5 usuários por veículo', 'Alertas automáticos', 'Cercas geográficas'],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-4 flex items-center justify-between text-left"
      >
        <span className="font-medium text-white pr-4">{q}</span>
        <ChevronRight className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="pb-4">
          <p className="text-white/70 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

function InfoPanel({ slide, onClose }: { slide: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-primary">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-primary flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Mais Informações</h2>
            <p className="text-white/60">{slide.title} - {slide.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Principais Vantagens
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {slide.benefits.map((b: string, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/90 text-sm">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              Perguntas Frequentes
            </h3>
            <div className="bg-white/5 rounded-2xl p-4">
              {slide.faqs.map((faq: any, i: number) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-2xl p-6 border border-primary/30">
            <h3 className="text-lg font-bold text-white mb-3">Fala com a Gente</h3>
            <p className="text-white/70 text-sm mb-4">Tira as tuas dúvidas com nosso time que é nota 10.</p>
            <div className="flex gap-3">
              <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                <Phone className="w-4 h-4 mr-2" />
                Liga pra Cá
              </Button>
              <Button variant="outline" className="flex-1 border-primary text-white hover:bg-primary/20">
                <MessageCircle className="w-4 h-4 mr-2" />
                Manda ZAP
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VitrineCarousel({ onStartRegistration }: { onStartRegistration: () => void }) {
  const [current, setCurrent] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-950">
      <LogosCarousel />
      
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-1000`} style={{ opacity: 0.95 }} />
        
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
        
        {/* 3D Effects - Slide 1: Radar Shield */}
        {slide.id === 'welcome' && (
          <>
            <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
              <div className="relative w-[700px] h-[700px] -mr-20" style={{ transform: 'perspective(1000px) rotateY(-15deg)' }}>
                <div className="absolute inset-0 border-4 border-white/10 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-12 border-4 border-white/15 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                <div className="absolute inset-24 border-4 border-white/20 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-36 border-2 border-white/25 rounded-full animate-spin" style={{ animationDuration: '7s', animationDirection: 'reverse' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-400/50 animate-pulse">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-400/40 rounded-full animate-ping" />
            <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-white/15 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </>
        )}
        
        {/* 3D Effects - Slide 2: GPS Signal Globe */}
        {slide.id === 'tracking' && (
          <>
            <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
              <div className="relative w-[600px] h-[600px] -mr-20" style={{ transform: 'perspective(1000px) rotateX(10deg) rotateY(-10deg)' }}>
                <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full" />
                <div className="absolute inset-4 border-2 border-cyan-400/25 rounded-full" />
                <div className="absolute inset-8 border-2 border-cyan-400/20 rounded-full" />
                <div className="absolute inset-12 border border-cyan-400/30" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-2xl shadow-cyan-400/50 flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-cyan-400 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${angle}deg) translateY(-250px)`,
                      transformOrigin: 'center',
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute top-1/4 right-1/3">
              <div className="relative">
                <div className="w-6 h-6 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-cyan-400/50 rounded-full animate-ping" />
                <div className="absolute inset-0 w-20 h-20 border border-cyan-400/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </>
        )}
        
        {/* 3D Effects - Slide 3: Lock Shield */}
        {slide.id === 'security' && (
          <>
            <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
              <div className="relative w-[600px] h-[600px] -mr-20" style={{ transform: 'perspective(1000px) rotateX(-5deg) rotateY(15deg)' }}>
                <div className="absolute inset-0 border-4 border-red-500/30 rounded-full" />
                <div className="absolute inset-12 border-4 border-red-500/25 rounded-full animate-pulse" />
                <div className="absolute inset-24 border-2 border-red-500/20 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-2xl shadow-red-500/50 flex items-center justify-center rotate-12" style={{ transform: 'perspective(500px) rotateX(10deg) rotateY(-10deg)' }}>
                      <Key className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-ping">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-1/4 right-1/3">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-red-500/50 rounded-full" />
                <div className="absolute inset-2 w-12 h-12 border-2 border-red-500/40 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-4 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              </div>
            </div>
          </>
        )}
        
        {/* 3D Effects - Slide 4: Data Analytics */}
        {slide.id === 'analytics' && (
          <>
            <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
              <div className="relative w-[600px] h-[600px] -mr-20" style={{ transform: 'perspective(1000px) rotateX(15deg) rotateY(-15deg)' }}>
                <div className="absolute inset-0 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/20" />
                <div className="absolute inset-8">
                  <div className="flex items-end justify-center gap-4 h-full">
                    {[60, 40, 80, 55, 90, 45, 70, 85].map((h, i) => (
                      <div
                        key={i}
                        className="w-8 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg animate-pulse"
                        style={{ 
                          height: `${h}%`,
                          animationDelay: `${i * 0.1}s`,
                          boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-2xl shadow-green-400/50 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/4 right-1/3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute w-6 h-1 bg-green-400/50 rounded-full"
                  style={{
                    top: `${i * 20}px`,
                    right: '0',
                    animation: `slideLeft ${2 + i * 0.5}s linear infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}
        
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center p-6">
        <Logo3D size={140} animated={true} glowColor="white" />
      </div>
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <Button
          onClick={() => navigate('/planos')}
          className="h-11 rounded-full border border-primary bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-md hover:bg-white/20 transition-all"
        >
          Planos
        </Button>
        <Button
          onClick={() => navigate('/admin/login')}
          className="h-11 rounded-full bg-white text-gray-900 px-6 text-sm font-semibold hover:bg-white/90 transition-all"
        >
          Acesso Restrito
        </Button>
      </div>

      <div className="relative z-10 flex h-full items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex flex-wrap gap-3">
                {slide.features.map((f: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white border border-primary">
                    <Check className="w-4 h-4 text-green-400" />
                    {f}
                  </span>
                ))}
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-tight">
                {slide.title}
                <br />
                <span className="text-white/80">{slide.subtitle}</span>
              </h1>

              <p className="text-xl text-white/70 max-w-lg">
                {slide.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={onStartRegistration}
                  size="lg"
                  className="h-14 px-8 text-lg bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 shadow-2xl shadow-black/20 transition-all hover:scale-105"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => setShowInfo(true)}
                  size="lg"
                  className="h-14 px-8 text-lg bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 backdrop-blur-md transition-all"
                >
                  <Eye className="mr-2 w-5 h-5" />
                  saiba mais
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-white/60" />
                  <span className="text-white/60 text-sm">Dados Protegidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-white/60" />
                  <span className="text-white/60 text-sm">Criptografia SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white/60" />
                  <span className="text-white/60 text-sm">Certificado</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative">
                <div className="bg-primary/20 backdrop-blur-xl rounded-3xl border border-primary p-6 shadow-2xl" style={{ transform: 'perspective(1000px) rotateY(-5deg)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/70 text-sm">Sistema Ativo</span>
                    </div>
                    <Clock className="w-5 h-5 text-white/50" />
                  </div>

                  <div className="bg-primary/10 rounded-2xl h-48 mb-4 flex items-center justify-center relative overflow-hidden">
                    <MapPin className="w-16 h-16 text-white/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping" style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                          animationDelay: `${i * 0.3}s`,
                        }} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {slide.stats.map((stat: any, i: number) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className="bg-primary/10 rounded-xl p-3 text-center">
                          <Icon className="w-5 h-5 text-white mx-auto mb-1" />
                          <p className="text-white font-bold text-sm">{stat.value}</p>
                          <p className="text-white/70 text-xs">{stat.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="absolute -left-8 top-1/4 bg-primary/20 backdrop-blur-md rounded-2xl p-4 border border-primary animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Veículo Protegido</p>
                      <p className="text-white/50 text-xs">BRA-1234</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 bg-primary/20 backdrop-blur-md rounded-2xl p-4 border border-primary animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Bloqueia na Hora</p>
                      <p className="text-white/50 text-xs">1 toque só</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-primary/20 backdrop-blur-md rounded-full px-6 py-3 border border-primary">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current ? 'w-12 bg-primary' : 'w-2 bg-white/30 hover:bg-primary/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-20">
        <div className="bg-primary/20 backdrop-blur-md rounded-xl px-4 py-2 border border-primary">
          <span className="text-white font-bold">{current + 1}</span>
          <span className="text-white/50 mx-1">/</span>
          <span className="text-white/50">{slides.length}</span>
        </div>
      </div>

      {showInfo && <InfoPanel slide={slide} onClose={() => setShowInfo(false)} />}
      
      <style>{`
        @keyframes slideLeft {
          0% { transform: translateX(100px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(-100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
