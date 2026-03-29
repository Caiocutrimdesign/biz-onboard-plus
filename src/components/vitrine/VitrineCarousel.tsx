import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import slideHero1 from '@/assets/slide-hero-1.jpg';
import slideHero2 from '@/assets/slide-hero-2.jpg';
import slideHero3 from '@/assets/slide-hero-3.jpg';
import slideHero4 from '@/assets/slide-hero-4.jpg';
import { Logo3D } from '@/components/ui/Logo3D';

const slides = [
  {
    image: slideHero1,
    title: 'Proteção Veicular',
    subtitle: 'com Tecnologia de Ponta',
    description: 'Seu veículo protegido 24 horas por dia com rastreamento inteligente e monitoramento em tempo real.',
  },
  {
    image: slideHero2,
    title: 'Rastreamento',
    subtitle: 'em Tempo Real',
    description: 'Saiba onde seu veículo está a qualquer momento. Acompanhe pelo celular com precisão total.',
  },
  {
    image: slideHero3,
    title: 'Bloqueio e',
    subtitle: 'Monitoramento',
    description: 'Proteção para carro, moto e frota. Bloqueio remoto e alertas instantâneos de segurança.',
  },
  {
    image: slideHero4,
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-surface-dark">
      <div className="absolute inset-0">
        <img
          src={slide.image}
          alt={slide.title}
          className="h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-dark/95 via-surface-dark/70 to-surface-dark/30" />
      </div>

      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-6">
        <Logo3D size={100} animated={true} glowColor="white" />
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/planos')}
            className="h-11 rounded-full border border-white/20 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur-md hover:bg-white/20"
          >
            Planos
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/login')}
            className="h-11 rounded-full border border-white/20 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur-md hover:bg-white/20"
          >
            Acesso Restrito
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-8 md:px-16">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-bold leading-tight text-white md:text-7xl">
              {slide.title}
              <br />
              <span className="text-primary">{slide.subtitle}</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 md:text-xl">
              {slide.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={onStartRegistration}
                className="bg-primary h-14 px-8 text-lg font-semibold text-white hover:bg-primary/90"
              >
                Começar Cadastro
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/planos')}
                className="h-14 px-8 text-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Conhecer Planos
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current ? 'w-12 bg-primary' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 right-8 z-20 text-right text-sm text-white/40">
        <p>Rastremix — Segurança Veicular</p>
        <p>0800 042 0009</p>
      </div>
    </div>
  );
}
