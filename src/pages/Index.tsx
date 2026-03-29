import { useState } from 'react';
import { VitrineCarousel } from '@/components/vitrine/VitrineCarousel';
import { RegistrationFlow } from '@/components/registration/RegistrationFlow';
import { LogosCarousel } from '@/components/ui/LogosCarousel';

const Index = () => {
  const [mode, setMode] = useState<'vitrine' | 'cadastro'>('vitrine');

  return (
    <>
      {mode === 'vitrine' && (
        <>
          <VitrineCarousel onStartRegistration={() => setMode('cadastro')} />
          <LogosCarousel />
        </>
      )}
      {mode === 'cadastro' && (
        <RegistrationFlow onClose={() => setMode('vitrine')} />
      )}
    </>
  );
};

export default Index;
