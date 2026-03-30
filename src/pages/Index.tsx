import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VitrineCarousel } from '@/components/vitrine/VitrineCarousel';
import { RegistrationFlow } from '@/components/registration/RegistrationFlow';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Building2 } from 'lucide-react';

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

          {/* Botão A Empresa - Canto inferior direito */}
          <button
            onClick={() => navigate('/empresa')}
            className="fixed bottom-6 right-6 z-[100] bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl shadow-black/50 flex items-center gap-3 transition-all transform hover:scale-105"
          >
            <Building2 className="w-6 h-6" />
            <span className="text-lg">A Empresa</span>
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
