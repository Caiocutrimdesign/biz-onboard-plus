import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Zap, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import slideHero1 from '@/assets/slide-hero-1.jpg';
import slideHero2 from '@/assets/slide-hero-2.jpg';
import slideHero3 from '@/assets/slide-hero-3.jpg';
import slideHero4 from '@/assets/slide-hero-4.jpg';
import logo from '@/assets/logo-rastremix.png';

const slides = [
  {
    image: slideHero1,
    icon: Shield,
    title: 'Proteção Veicular',
    subtitle: 'com Tecnologia de Ponta',
    description: 'Seu veículo protegido 24 horas por dia com rastreamento inteligente e monitoramento em tempo real.',
  },
  {
    image: slideHero2,
    icon: MapPin,
    title: 'Rastreamento',
    subtitle: 'em Tempo Real',
    description: 'Saiba onde seu veículo está a qualquer momento. Acompanhe pelo celular com precisão total.',
  },
  {
    image: slideHero3,
    icon: Zap,
    title: 'Bloqueio e',
    subtitle: 'Monitoramento',
    description: 'Proteção para carro, moto e frota. Bloqueio remoto e alertas instantâneos de segurança.',
  },
  {
    image: slideHero4,
    icon: Phone,
    title: 'Atendimento Ágil',
    subtitle: 'e Planos Acessíveis',
    description: 'Processo simples e rápido. Planos a partir de R$ 50/mês com instalação inclusa.',
  },
];

interface VitrineCarouselProps {
  onStartRegistration: () => void;
}

export function VitrineCarousel({ onStartRegistration }: VitrineCarouselProps) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-surface-dark">
      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-dark/95 via-surface-dark/70 to-surface-dark/30" />
        </motion.div>
      </AnimatePresence>

      {/* Header with Logo and Restricted Access */}
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-8">
        <img src={logo} alt="Rastremix" className="h-16 w-auto" />
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/planos')}
            className="group flex h-11 items-center gap-2 rounded-full border border-surface-dark-foreground/10 bg-surface-dark-foreground/5 px-6 text-sm font-medium text-surface-dark-foreground backdrop-blur-md transition-all hover:bg-surface-dark-foreground/10 hover:shadow-lg"
          >
            <Shield className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
            Planos
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/admin/login'}
            className="group flex h-11 items-center gap-2 rounded-full border border-surface-dark-foreground/10 bg-surface-dark-foreground/5 px-6 text-sm font-medium text-surface-dark-foreground backdrop-blur-md transition-all hover:bg-surface-dark-foreground/10 hover:shadow-lg"
          >
            <Shield className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
            Acesso Restrito
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-8 md:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm">
                <slide.icon className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-5xl font-bold leading-tight text-surface-dark-foreground md:text-7xl">
                {slide.title}
                <br />
                <span className="text-gradient-primary">{slide.subtitle}</span>
              </h1>
              <p className="mt-6 text-lg text-surface-dark-foreground/70 md:text-xl">
                {slide.description}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={onStartRegistration}
                  className="bg-gradient-brand shadow-brand animate-pulse-glow h-14 px-8 text-lg font-semibold text-primary-foreground hover:opacity-90"
                >
                  Começar Cadastro
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/planos')}
                  className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30"
                >
                  Conhecer Planos
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current ? 'w-12 bg-primary' : 'w-2 bg-surface-dark-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-8 right-8 z-20 text-right text-sm text-surface-dark-foreground/40">
        <p>Rastremix — Segurança Veicular</p>
        <p>0800 042 0009</p>
      </div>
    </div>
  );
}
