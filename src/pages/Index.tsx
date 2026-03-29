import { useState } from 'react';
import { VitrineCarousel } from '@/components/vitrine/VitrineCarousel';
import { RegistrationFlow } from '@/components/registration/RegistrationFlow';

const Index = () => {
  const [mode, setMode] = useState<'vitrine' | 'cadastro'>('vitrine');

  return (
    <>
      {mode === 'vitrine' && (
        <VitrineCarousel onStartRegistration={() => setMode('cadastro')} />
      )}
      {mode === 'cadastro' && (
        <RegistrationFlow onClose={() => setMode('vitrine')} />
      )}
    </>
  );
};

export default Index;
