import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const logos = [
  { src: '/LOGOS/2222(1).png', name: 'Rastremix Principal' },
  { src: '/LOGOS/logo.png', name: 'Logo' },
  { src: '/LOGOS/logotipo-1.png', name: 'Logotipo' },
  { src: '/LOGOS/logo-gpslove.png', name: 'GPS Love' },
  { src: '/LOGOS/icone-valeteck', name: 'Valeteck' },
  { src: '/LOGOS/logo-site-1024x724.png', name: 'Logo Site' },
];

export function LogosCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % logos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full py-8 bg-gradient-to-r from-transparent via-muted/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-6">
          Nossos Parceiros e Marcas
        </p>
        
        <div className="relative h-32 md:h-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-border p-6 md:p-8 max-w-md w-full">
                <img
                  src={logos[current].src}
                  alt={logos[current].name}
                  className="w-full h-24 md:h-28 object-contain"
                />
                <p className="text-center text-xs text-muted-foreground mt-3">
                  {logos[current].name}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {logos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Logo counter */}
        <div className="flex justify-center items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span className="font-medium text-primary">{current + 1}</span>
          <span>/</span>
          <span>{logos.length}</span>
        </div>
      </div>
    </div>
  );
}
