import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, MapPin, Zap, BarChart3, Users, Car, Bell, Check, 
  ArrowRight, X, ChevronRight, Phone, Video, MessageCircle,
  Lock, Eye, Globe, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo3D } from '@/components/ui/Logo3D';

const slides = [
  {
    id: 'welcome',
    title: 'Proteção Total',
    subtitle: 'Para Seu Veículo',
    description: 'Sistema completo de rastreamento e proteção veicular. Sua tranquilidade é nossa prioridade 24 horas por dia.',
    gradient: 'from-orange-600 via-red-600 to-pink-600',
    features: ['Monitoramento 24h', 'Alertas em Tempo Real', 'Bloqueio Imediato'],
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
    title: 'Acompanhe',
    subtitle: 'Onde Estiver',
    description: 'Veja a localização do seu veículo em tempo real, de qualquer lugar do Brasil.',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    features: ['GPS de Alta Precisão', 'Cobertura em Todo BR', 'Atualizações ao Vivo'],
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
    subtitle: 'Na Hora Certa',
    description: 'Em caso de emergência, bloqueie o motor do seu veículo à distância em segundos.',
    gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    features: ['Bloqueio Remoto', 'Alerta de Emergência', 'Central 24h'],
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
    subtitle: 'Detalhados',
    description: 'Acesse todos os dados do seu veículo: rotas, velocidades, alertas e muito mais.',
    gradient: 'from-emerald-600 via-green-600 to-lime-600',
    features: ['Dados em Tempo Real', 'Relatórios Inteligentes', 'Análises Completas'],
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
          {/* Benefits */}
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

          {/* FAQ */}
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

          {/* Contact */}
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
      {/* Background */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-1000`} style={{ opacity: 0.95 }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-6">
        <Logo3D size={80} animated={true} glowColor="white" />
        <div className="flex items-center gap-3">
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Feature Badges */}
              <div className="flex flex-wrap gap-3">
                {slide.features.map((f: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white border border-primary">
                    <Check className="w-4 h-4 text-green-400" />
                    {f}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-tight">
                {slide.title}
                <br />
                <span className="text-white/80">{slide.subtitle}</span>
              </h1>

              {/* Description */}
              <p className="text-xl text-white/70 max-w-lg">
                {slide.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={onStartRegistration}
                  size="lg"
                  className="h-14 px-8 text-lg bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 shadow-2xl shadow-black/20 transition-all hover:scale-105"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => setShowInfo(true)}
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-2 border-primary text-white font-semibold rounded-xl hover:bg-primary/20 backdrop-blur-md transition-all"
                >
                  <Eye className="mr-2 w-5 h-5" />
                  saiba mais
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-white/60" />
                  <span className="text-white/60 text-sm">Feito no Maranhão</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-white/60" />
                  <span className="text-white/60 text-sm">Conexão Zica</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-primary p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/70 text-sm">Sistema Ativo</span>
                    </div>
                    <Clock className="w-5 h-5 text-white/50" />
                  </div>

                  <div className="bg-white/5 rounded-2xl h-48 mb-4 flex items-center justify-center relative overflow-hidden">
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
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Eye className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-white font-bold">Tá de Olho</p>
                      <p className="text-white/50 text-xs">24 horas</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-white font-bold">Tá Seguro</p>
                      <p className="text-white/50 text-xs">100% tranquilo</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Check className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-white font-bold">Tudo Tranquilo</p>
                      <p className="text-white/50 text-xs">Sem alertas</p>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -left-8 top-1/4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-primary animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Veículo Arretado</p>
                      <p className="text-white/50 text-xs">BRA-1234</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-primary animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
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

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-primary">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current ? 'w-12 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-primary">
          <span className="text-white font-bold">{current + 1}</span>
          <span className="text-white/50 mx-1">/</span>
          <span className="text-white/50">{slides.length}</span>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && <InfoPanel slide={slide} onClose={() => setShowInfo(false)} />}
    </div>
  );
}
