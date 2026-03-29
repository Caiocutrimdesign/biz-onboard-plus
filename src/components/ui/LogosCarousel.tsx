import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const logos = [
  { src: '/LOGOS/2222(1).png', name: 'Rastremix' },
  { src: '/LOGOS/logo.png', name: 'Logo' },
  { src: '/LOGOS/logotipo-1.png', name: 'Logotipo' },
  { src: '/LOGOS/logo-gpslove.png', name: 'GPS Love' },
  { src: '/LOGOS/icone-valeteck', name: 'Valeteck' },
  { src: '/LOGOS/logo-site-1024x724.png', name: 'Site' },
];

export function LogosCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % logos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full py-2 bg-primary/10 border-b border-primary/20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative h-12 md:h-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img
                src={logos[current].src}
                alt={logos[current].name}
                className="h-8 md:h-10 w-auto object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-1">
          {logos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current 
                  ? 'w-4 bg-primary' 
                  : 'w-1.5 bg-primary/30 hover:bg-primary/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
