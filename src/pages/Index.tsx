import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { VitrineCarousel } from '@/components/vitrine/VitrineCarousel';
import { RegistrationFlow } from '@/components/registration/RegistrationFlow';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Building2, Shield, Zap, Globe } from 'lucide-react';

const Index = () => {
  const [mode, setMode] = useState<'vitrine' | 'cadastro'>('vitrine');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.log('Fullscreen não suportado');
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0A0B] text-white selection:bg-primary/30 scroll-smooth overflow-x-hidden">
      <Navbar />

      <AnimatePresence mode="wait">
        {mode === 'vitrine' ? (
          <motion.div
            key="vitrine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Hero Section / Carousel */}
            <div className="relative z-10 pt-20">
              <VitrineCarousel onStartRegistration={() => setMode('cadastro')} />
            </div>
            
            {/* Overlay Features - Glass Cards */}
            <div className="max-w-7xl mx-auto px-6 pb-20 relative z-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[
                  { icon: Shield, title: 'Monitoramento 24h', desc: 'Central de inteligência dedicada para sua proteção.' },
                  { icon: Zap, title: 'Resposta Rápida', desc: 'Acionamento imediato e suporte tático especializado.' },
                  { icon: Globe, title: 'Cobertura Nacional', desc: 'Segurança e tecnologia em todo o território.' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 rounded-3xl group hover:bg-white/15 transition-all duration-500"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 font-display">{feature.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
              <Button
                onClick={() => navigate('/empresa')}
                className="bg-white text-black hover:bg-white/90 px-8 py-7 rounded-2xl font-bold shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
              >
                <Building2 className="w-6 h-6 text-primary" />
                <span className="text-lg">A Empresa</span>
              </Button>
              
              <button
                onClick={toggleFullscreen}
                className="self-end bg-white/5 hover:bg-white/10 text-white p-4 rounded-2xl backdrop-blur-xl border border-white/10 transition-all shadow-xl"
                title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-white/70" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white/70" />
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cadastro"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 z-[200] bg-[#0A0A0B]"
          >
            <RegistrationFlow onClose={() => setMode('vitrine')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;

