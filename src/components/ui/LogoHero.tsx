import { useState, useEffect, useRef } from 'react';
import logoSrc from '@/assets/logo-rastremix.png';

interface LogoHeroProps {
  className?: string;
}

export function LogoHero({ className = '' }: LogoHeroProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isHovered) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateY = ((e.clientX - centerX) / rect.width) * 30;
      const rotateX = ((centerY - e.clientY) / rect.height) * 30;
      
      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Glow background */}
      <div 
        className="absolute inset-0 rounded-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'glowPulse 3s ease-in-out infinite',
        }}
      />

      {/* Floating particles */}
      <div className="absolute -top-4 -right-4 w-3 h-3 bg-orange-500 rounded-full" style={{ animation: 'floatParticle 3s ease-in-out infinite' }} />
      <div className="absolute -bottom-2 -left-4 w-2 h-2 bg-orange-400 rounded-full" style={{ animation: 'floatParticle2 4s ease-in-out infinite' }} />
      <div className="absolute top-1/2 -right-6 w-2 h-2 bg-orange-300 rounded-full" style={{ animation: 'floatParticle3 2.5s ease-in-out infinite' }} />
      
      {/* Main logo card */}
      <div 
        className="relative cursor-pointer"
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setRotation({ x: 0, y: 0 });
        }}
      >
        {/* Card shadow */}
        <div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-600/50 to-red-600/50 blur-xl"
          style={{
            transform: 'translateZ(-50px)',
            opacity: isHovered ? 0.8 : 0.5,
          }}
        />

        {/* Card body */}
        <div className="relative w-48 h-48 rounded-3xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600" />
          
          {/* Animated gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />

          {/* Logo image */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <img 
              src={logoSrc} 
              alt="Logo" 
              className={`w-full h-full object-contain drop-shadow-2xl transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          </div>

          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Top highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent" />
        </div>

        {/* Shine effect on hover */}
        {isHovered && (
          <div 
            className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
              animation: 'shineMove 1s ease-out',
            }}
          />
        )}
      </div>

      {/* Ring decorations */}
      <div 
        className="absolute -inset-4 rounded-full border-2 border-orange-500/20"
        style={{ animation: 'ringPulse 2s ease-in-out infinite' }}
      />
      <div 
        className="absolute -inset-8 rounded-full border border-orange-500/10"
        style={{ animation: 'ringPulse 2s ease-in-out infinite 0.5s' }}
      />

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shineMove {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0); opacity: 1; }
          50% { transform: translate(10px, -20px); opacity: 0.5; }
        }
        @keyframes floatParticle2 {
          0%, 100% { transform: translate(0, 0); opacity: 0.7; }
          50% { transform: translate(-15px, -10px); opacity: 1; }
        }
        @keyframes floatParticle3 {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          50% { transform: translate(5px, -15px); opacity: 0.8; }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

interface Logo3DProps {
  size?: number;
  className?: string;
  animated?: boolean;
  glowColor?: 'primary' | 'white' | 'blue';
}

export function Logo3D({ size = 120, className = '', animated = true, glowColor = 'primary' }: Logo3DProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!animated) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * -15;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [animated]);

  const colors = {
    primary: { glow: 'rgba(234, 88, 12, 0.6)', inner: 'rgba(249, 115, 22, 0.4)' },
    white: { glow: 'rgba(255, 255, 255, 0.6)', inner: 'rgba(255, 255, 255, 0.3)' },
    blue: { glow: 'rgba(59, 130, 246, 0.6)', inner: 'rgba(59, 130, 246, 0.3)' },
  }[glowColor];

  const style: React.CSSProperties = animated ? {
    transform: `perspective(1000px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
    transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out',
  } : {};

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: 'blur(20px)',
          transform: 'scale(1.2)',
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Card */}
      <div className="relative w-full h-full" style={style}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/90 to-red-600/90 shadow-2xl" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-white/10" />
        
        <div className="absolute inset-2 flex items-center justify-center">
          <img
            src={logoSrc}
            alt="Logo"
            className={`max-w-full max-h-full object-contain drop-shadow-xl ${isHovered ? 'scale-105' : 'scale-100'} transition-transform duration-300`}
          />
        </div>

        {/* Shine */}
        {isHovered && (
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
              animation: 'shine 1s ease-out',
            }}
          />
        )}
      </div>

      {/* Particles */}
      {animated && (
        <>
          <div
            className="absolute w-1 h-1 bg-orange-400 rounded-full"
            style={{
              top: '20%',
              left: '10%',
              boxShadow: `0 0 8px ${colors.glow}`,
              animation: 'particle1 2s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 bg-orange-300 rounded-full"
            style={{
              bottom: '30%',
              right: '15%',
              boxShadow: `0 0 6px ${colors.inner}`,
              animation: 'particle2 3s ease-in-out infinite',
            }}
          />
        </>
      )}

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes particle1 {
          0%, 100% { transform: translate(0, 0); opacity: 1; }
          50% { transform: translate(8px, -12px); opacity: 0.5; }
        }
        @keyframes particle2 {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          50% { transform: translate(-10px, -8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default LogoHero;
