import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, MapPin, Zap, BarChart3, Users, Car, Bell, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo3D } from '@/components/ui/Logo3D';

const slides = [
  {
    id: 'welcome',
    title: 'Proteção Veicular',
    subtitle: 'Inteligente e Confiável',
    description: 'Sistema completo de rastreamento e proteção para seu veículo 24 horas por dia.',
    gradient: 'from-orange-600 via-red-600 to-pink-600',
    features: ['24/7 Monitoring', 'Real-time Alerts', 'Instant Blocking'],
  },
  {
    id: 'tracking',
    title: 'Rastreamento',
    subtitle: 'em Tempo Real',
    description: 'Acompanhe a localização do seu veículo em qualquer lugar do Brasil.',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    features: ['GPS Precision', 'Nationwide Coverage', 'Live Updates'],
  },
  {
    id: 'security',
    title: 'Segurança',
    subtitle: 'Bloqueio Instantâneo',
    description: 'Bloqueie o motor do seu veículo à distância em caso de emergência.',
    gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    features: ['Remote Block', 'Emergency Alert', 'SOC 24h'],
  },
  {
    id: 'analytics',
    title: 'Dashboard',
    subtitle: 'Inteligente',
    description: 'Visualize todos os dados do seu negócio em um único lugar.',
    gradient: 'from-emerald-600 via-green-600 to-lime-600',
    features: ['Real-time Data', 'Smart Reports', 'Growth Insights'],
  },
];

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = value;
          const incrementTime = duration / end;
          const timer = setInterval(() => {
            start += Math.ceil(end / 50);
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, incrementTime);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function FloatingCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="absolute"
    >
      {children}
    </motion.div>
  );
}

import { motion } from 'framer-motion';

function StatsCard({ icon: Icon, value, label, delay }: { icon: any; value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
    >
      <Icon className="w-6 h-6 text-white/70 mb-2" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/60">{label}</p>
    </motion.div>
  );
}

function FeatureBadge({ text }: { text: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white border border-white/20"
    >
      <Check className="w-4 h-4 text-green-400" />
      {text}
    </motion.span>
  );
}

export function VitrineCarousel({ onStartRegistration }: { onStartRegistration: () => void }) {
  const [current, setCurrent] = useState(0);
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
      {/* Animated Background Gradient */}
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-1000`}
          style={{ opacity: 0.9 }}
        />
        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Floating Glow Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-6">
        <Logo3D size={80} animated={true} glowColor="white" />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/planos')}
            className="h-11 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-md hover:bg-white/20 transition-all"
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
              <motion.div
                key={`badges-${current}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-3"
              >
                {slide.features.map((f, i) => (
                  <FeatureBadge key={i} text={f} />
                ))}
              </motion.div>

              {/* Title */}
              <motion.div
                key={`title-${current}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-tight">
                  {slide.title}
                  <br />
                  <span className="text-white/80">{slide.subtitle}</span>
                </h1>
              </motion.div>

              {/* Description */}
              <motion.p
                key={`desc-${current}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/70 max-w-lg"
              >
                {slide.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                key={`cta-${current}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  onClick={onStartRegistration}
                  size="lg"
                  className="h-14 px-8 text-lg bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 shadow-2xl shadow-black/20 transition-all hover:scale-105"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => navigate('/admin/login')}
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 backdrop-blur-md transition-all"
                >
                  Ver Demo
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-6 pt-4"
              >
                <StatsCard icon={Users} value="10K+" label="Clientes" delay={0.7} />
                <StatsCard icon={Car} value="15K+" label="Veículos" delay={0.8} />
                <StatsCard icon={Shield} value="99.9%" label="Uptime" delay={0.9} />
              </motion.div>
            </div>

            {/* Right Visual - Animated Dashboard Preview */}
            <motion.div
              key={`visual-${current}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/70 text-sm">Live Tracking</span>
                    </div>
                    <span className="text-white/50 text-sm">Updated now</span>
                  </div>

                  {/* Map Placeholder */}
                  <div className="bg-white/5 rounded-2xl h-48 mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-green-400 rounded-full"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-center z-10">
                      <MapPin className="w-12 h-12 text-white/30 mx-auto mb-2" />
                      <p className="text-white/50 text-sm">Vehicle Tracking Active</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Car className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-bold">24</p>
                      <p className="text-white/50 text-xs">Online</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-white font-bold">100%</p>
                      <p className="text-white/50 text-xs">Secure</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Bell className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-white font-bold">3</p>
                      <p className="text-white/50 text-xs">Alerts</p>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -left-8 top-1/4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Vehicle Protected</p>
                      <p className="text-white/50 text-xs">ABC-1234</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -right-4 bottom-1/4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Quick Block</p>
                      <p className="text-white/50 text-xs">One tap</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
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

      {/* Slide Indicator */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
          <span className="text-white font-bold">{current + 1}</span>
          <span className="text-white/50 mx-1">/</span>
          <span className="text-white/50">{slides.length}</span>
        </div>
      </div>
    </div>
  );
}
