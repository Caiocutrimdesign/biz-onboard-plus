import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, MapPin, Zap, BarChart3, Users, Car, Bell, Check, 
  ArrowRight, X, ChevronRight, Phone, Video, MessageCircle,
  Lock, Eye, Globe, Clock, AlertTriangle, CheckCircle2,
  Target, Key, FileText, Heart, Star, Award, Truck
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

function SlideEffects({ slideId }: { slideId: string }) {
  if (slideId === 'welcome') {
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
          <motion.div 
            className="relative w-[700px] h-[700px] -mr-20"
            style={{ transform: 'perspective(1000px) rotateY(-15deg)' }}
            animate={{ rotateY: -15, rotateX: 5 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.div 
              className="absolute inset-0 border-4 border-white/10 rounded-full" 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
              className="absolute inset-12 border-4 border-white/15 rounded-full" 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
              className="absolute inset-24 border-4 border-white/20 rounded-full" 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
              className="absolute inset-36 border-2 border-white/25 rounded-full" 
              animate={{ rotate: -360 }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-400/50">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>
        <motion.div 
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-400/40 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/3 w-3 h-3 bg-white/20 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-white/15 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </>
    );
  }

  if (slideId === 'tracking') {
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
          <motion.div 
            className="relative w-[600px] h-[600px] -mr-20"
            style={{ transform: 'perspective(1000px) rotateX(10deg) rotateY(-10deg)' }}
            animate={{ rotateY: -10, rotateX: [10, 15, 10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div 
              className="absolute inset-0 border-2 border-cyan-400/30 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div className="absolute inset-4 border-2 border-cyan-400/25 rounded-full" />
            <motion.div className="absolute inset-8 border-2 border-cyan-400/20 rounded-full" />
            <motion.div className="absolute inset-12 border border-cyan-400/30" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-2xl shadow-cyan-400/50 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-cyan-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${angle}deg) translateY(-250px)`,
                  transformOrigin: 'center',
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </div>
        <motion.div 
          className="absolute top-1/4 right-1/3"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="relative">
            <div className="w-6 h-6 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
            <motion.div className="absolute inset-0 w-12 h-12 border-2 border-cyan-400/50 rounded-full" animate={{ scale: [1, 2], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.div className="absolute inset-0 w-20 h-20 border border-cyan-400/30 rounded-full" animate={{ scale: [1, 2.5], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
          </div>
        </motion.div>
      </>
    );
  }

  if (slideId === 'security') {
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
          <motion.div 
            className="relative w-[600px] h-[600px] -mr-20"
            style={{ transform: 'perspective(1000px) rotateX(-5deg) rotateY(15deg)' }}
            animate={{ rotateY: [15, 20, 15], rotateX: [-5, 0, -5] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div className="absolute inset-0 border-4 border-red-500/30 rounded-full" />
            <motion.div 
              className="absolute inset-12 border-4 border-red-500/25 rounded-full" 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div className="absolute inset-24 border-2 border-red-500/20 rounded-full" />
            <motion.div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="relative"
                animate={{ rotate: [12, 15, 12], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-2xl shadow-red-500/50 flex items-center justify-center" style={{ transform: 'perspective(500px) rotateX(10deg) rotateY(-10deg)' }}>
                  <Key className="w-12 h-12 text-white" />
                </div>
                <motion.div 
                  className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        <motion.div 
          className="absolute bottom-1/4 right-1/3"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-500/50 rounded-full" />
            <motion.div className="absolute inset-2 w-12 h-12 border-2 border-red-500/40 rounded-full" />
            <motion.div className="absolute inset-4 w-4 h-4 bg-red-500 rounded-full" />
          </div>
        </motion.div>
      </>
    );
  }

  if (slideId === 'analytics') {
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
          <motion.div 
            className="relative w-[600px] h-[600px] -mr-20"
            style={{ transform: 'perspective(1000px) rotateX(15deg) rotateY(-15deg)' }}
            animate={{ rotateY: [-15, -10, -15], rotateX: [15, 20, 15] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div className="absolute inset-0 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/20" />
            <div className="absolute inset-8">
              <div className="flex items-end justify-center gap-4 h-full">
                {[60, 40, 80, 55, 90, 45, 70, 85].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-8 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg"
                    initial={{ height: '0%' }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
                  />
                ))}
              </div>
            </div>
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-2xl shadow-green-400/50 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>
        <motion.div className="absolute top-1/4 right-1/3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-6 h-1 bg-green-400/50 rounded-full"
              style={{ top: `${i * 20}px`, right: '0' }}
              animate={{ x: [0, -50, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.div>
      </>
    );
  }

  return null;
}

function SlideCard({ slide, onStartRegistration }: { slide: any; onStartRegistration: () => void }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      <motion.div 
        className="bg-primary/20 backdrop-blur-xl rounded-3xl border border-primary p-6 shadow-2xl"
        style={{ transform: 'perspective(1000px) rotateY(-5deg)' }}
        animate={{ rotateY: [-5, -8, -5], rotateX: [0, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div 
          className="flex items-center justify-between mb-6"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-3 h-3 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.3, 1], boxShadow: ['0 0 0 rgba(74,222,128,0)', '0 0 20px rgba(74,222,128,0.5)', '0 0 0 rgba(74,222,128,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-white/70 text-sm">Sistema Ativo</span>
          </div>
          <Clock className="w-5 h-5 text-white/50" />
        </motion.div>

        <motion.div 
          className="bg-primary/10 rounded-2xl h-48 mb-4 flex items-center justify-center relative overflow-hidden"
          animate={{ boxShadow: ['0 0 0 rgba(var(--primary-rgb),0)', '0 0 30px rgba(var(--primary-rgb),0.3)', '0 0 0 rgba(var(--primary-rgb),0)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <MapPin className="w-16 h-16 text-white/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={i} 
                className="absolute w-2 h-2 bg-green-400 rounded-full"
                initial={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%` }}
                animate={{ scale: [0, 1.5, 0], opacity: [1, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
              />
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {slide.stats.map((stat: any, i: number) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={i} 
                className="bg-primary/10 rounded-xl p-3 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--primary-rgb),0.2)' }}
              >
                <Icon className="w-5 h-5 text-white mx-auto mb-1" />
                <p className="text-white font-bold text-sm">{stat.value}</p>
                <p className="text-white/70 text-xs">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div 
        className="absolute -left-8 top-1/4 bg-primary/20 backdrop-blur-md rounded-2xl p-4 border border-primary"
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Check className="w-5 h-5 text-green-400" />
          </motion.div>
          <div>
            <p className="text-white font-medium text-sm">Veículo Protegido</p>
            <p className="text-white/50 text-xs">BRA-1234</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="absolute -right-4 bottom-1/4 bg-primary/20 backdrop-blur-md rounded-2xl p-4 border border-primary"
        animate={{ y: [0, 10, 0], rotate: [2, -2, 2] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Zap className="w-5 h-5 text-blue-400" />
          </motion.div>
          <div>
            <p className="text-white font-medium text-sm">Bloqueia na Hora</p>
            <p className="text-white/50 text-xs">1 toque só</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
            style={{ opacity: 0.95 }}
          />
        </AnimatePresence>

        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + '-effects'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <SlideEffects slideId={slide.id} />
          </motion.div>
        </AnimatePresence>
        
        <motion.div 
          className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        {/* Flash Car Animation - Sonic Style */}
        <motion.div
          className="absolute right-[-100px] top-1/2 -translate-y-1/2 z-20 w-[700px] h-[500px]"
          initial={{ x: window.innerWidth + 200, opacity: 1 }}
          animate={{ 
            x: -window.innerWidth - 200,
            opacity: [0, 1, 1, 0],
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 7,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          {/* Speed Lines - Behind */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`speedline-${i}`}
              className="absolute top-1/2 bg-gradient-to-r from-transparent via-white/60 to-white/80"
              style={{ 
                left: '-300px',
                height: i % 3 === 0 ? 'h-1' : i % 3 === 1 ? 'h-0.5' : 'h-0.5',
                width: `${100 + Math.random() * 200}px`,
                transform: `translateY(${(i - 7) * 30}px)`
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ 
                scaleX: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 0.4,
                repeat: Infinity,
                repeatDelay: 7 + (i * 0.08),
                ease: 'easeOut'
              }}
            />
          ))}
          
          {/* Main Car Image with Glow */}
          <div className="relative">
            <motion.img
              src="/Gemini_Generated_Image_ayfyv9ayfyv9ayfy.png"
              alt="Carro"
              className="w-[450px] h-auto drop-shadow-2xl relative z-10"
              animate={{ 
                rotate: [-1, 1, -1],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 0.3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            {/* Glow behind car */}
            <motion.div
              className="absolute inset-0 z-0"
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 blur-xl rounded-full" />
            </motion.div>
          </div>
          
          {/* Flash Burst Effect */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 2, 3],
            }}
            transition={{ 
              duration: 0.3,
              repeat: Infinity,
              repeatDelay: 7,
              ease: 'easeOut'
            }}
          >
            <div className="w-60 h-60 bg-white/40 rounded-full blur-3xl" />
          </motion.div>
          
          {/* Trail Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full shadow-lg shadow-white/50"
              initial={{ 
                x: 100, 
                y: (i - 10) * 15, 
                opacity: 1 
              }}
              animate={{ 
                x: -500 - Math.random() * 300,
                y: (i - 10) * 15 + (Math.random() - 0.5) * 80,
                opacity: [1, 0.8, 0],
                scale: [1, 0.5, 0]
              }}
              transition={{ 
                duration: 0.5 + Math.random() * 0.3,
                repeat: Infinity,
                repeatDelay: 7 + (i * 0.05),
                ease: 'easeOut'
              }}
            />
          ))}
        </motion.div>
        
        {/* Ground Reflection */}
        <motion.div
          className="absolute bottom-24 right-0 w-[600px] h-24 bg-white/10 rounded-full blur-3xl z-10"
          animate={{ 
            x: [window.innerWidth + 400, -window.innerWidth - 400],
            opacity: [0, 0.6, 0.6, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 7,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        />
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
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '-content'}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, x: -100, scale: 0.95, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-8">
                <motion.div 
                  className="flex flex-wrap gap-3"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.6 } }}
                >
                  {slide.features.map((f: string, i: number) => (
                    <motion.span 
                      key={i} 
                      className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white border border-primary"
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <Check className="w-4 h-4 text-green-400" />
                      {f}
                    </motion.span>
                  ))}
                </motion.div>

                <motion.h1 
                  className="font-display text-5xl md:text-7xl font-black text-white leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } }}
                >
                  {slide.title}
                  <br />
                  <motion.span 
                    className="text-white/80"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {slide.subtitle}
                  </motion.span>
                </motion.h1>

                <motion.p 
                  className="text-xl text-white/70 max-w-lg"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.6 } }}
                >
                  {slide.description}
                </motion.p>

                <motion.div 
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.6 } }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={onStartRegistration}
                      size="lg"
                      className="h-14 px-8 text-lg bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 shadow-2xl shadow-black/20 transition-all"
                    >
                      Começar Agora
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => setShowInfo(true)}
                      size="lg"
                      className="h-14 px-8 text-lg bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 backdrop-blur-md transition-all"
                    >
                      <Eye className="mr-2 w-5 h-5" />
                      saiba mais
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="flex items-center gap-6 pt-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.75, duration: 0.6 } }}
                >
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Shield className="w-5 h-5 text-white/60" />
                    <span className="text-white/60 text-sm">Dados Protegidos</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Lock className="w-5 h-5 text-white/60" />
                    <span className="text-white/60 text-sm">Criptografia SSL</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-white/60" />
                    <span className="text-white/60 text-sm">Certificado</span>
                  </motion.div>
                </motion.div>
              </div>

              <div className="hidden lg:block">
                <AnimatePresence mode="wait">
                  <SlideCard key={slide.id + '-card'} slide={slide} onStartRegistration={onStartRegistration} />
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-4 bg-primary/20 backdrop-blur-md rounded-full px-6 py-3 border border-primary">
          {slides.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current ? 'w-12 bg-primary' : 'w-2 bg-white/30 hover:bg-primary/50'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="absolute bottom-8 right-8 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="bg-primary/20 backdrop-blur-md rounded-xl px-4 py-2 border border-primary">
          <span className="text-white font-bold">{current + 1}</span>
          <span className="text-white/50 mx-1">/</span>
          <span className="text-white/50">{slides.length}</span>
        </div>
      </motion.div>

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
