import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { VitrineCarousel } from '@/components/vitrine/VitrineCarousel';
import { RegistrationFlow } from '@/components/registration/RegistrationFlow';
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
    <div ref={containerRef} className="min-h-screen bg-gray-50/50 text-gray-900 selection:bg-blue-100 scroll-smooth overflow-x-hidden">
      <AnimatePresence mode="wait">
        {mode === 'vitrine' ? (
          <motion.div
            key="vitrine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[140px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-100/20 rounded-full blur-[140px]" />
            </div>

            {/* Hero Section / Carousel */}
            <div className="relative z-10 border-b border-gray-100 shadow-sm">
              <VitrineCarousel onStartRegistration={() => setMode('cadastro')} />
            </div>
            
            {/* Overlay Features - Premium Cards */}
            <div className="max-w-7xl mx-auto px-6 pb-24 relative z-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                {[
                  { icon: Shield, title: 'Monitoramento 24h', desc: 'Central de inteligência dedicada para sua proteção constante.' },
                  { icon: Zap, title: 'Resposta Rápida', desc: 'Acionamento imediato e suporte tático de alta prontidão.' },
                  { icon: Globe, title: 'Cobertura Nacional', desc: 'Segurança robusta e tecnologia em todo o país.' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 group hover:border-blue-200 hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 font-display tracking-tight text-gray-900">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-5">
              <Button
                onClick={() => navigate('/admin')}
                className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-8 rounded-3xl font-black shadow-2xl flex items-center gap-4 transition-all transform hover:scale-105 active:scale-95 group tracking-widest uppercase text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                Portal Restrito
              </Button>
              
              <button
                onClick={toggleFullscreen}
                className="self-end bg-white hover:bg-gray-50 text-gray-400 p-5 rounded-2xl border border-gray-200 transition-all shadow-xl hover:text-blue-500"
                title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-6 h-6" />
                ) : (
                  <Maximize2 className="w-6 h-6" />
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cadastro"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="fixed inset-0 z-[200] bg-gray-50"
          >
            <RegistrationFlow onClose={() => setMode('vitrine')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;

