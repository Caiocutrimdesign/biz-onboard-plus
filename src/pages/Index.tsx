import { useState, useEffect, useRef } from 'react';
import { VitrineCarousel } from '@/components/vitrine/VitrineCarousel';
import { RegistrationFlow } from '@/components/registration/RegistrationFlow';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

const Index = () => {
  const [mode, setMode] = useState<'vitrine' | 'cadastro'>('vitrine');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="fixed inset-0 bg-black">
      {mode === 'vitrine' && (
        <>
          <VitrineCarousel onStartRegistration={() => setMode('cadastro')} />
          
          {/* Botão Tela Cheia */}
          <button
            onClick={toggleFullscreen}
            className="fixed top-4 right-4 z-[100] bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </>
      )}
      {mode === 'cadastro' && (
        <RegistrationFlow onClose={() => setMode('vitrine')} />
      )}
    </div>
  );
};

export default Index;
