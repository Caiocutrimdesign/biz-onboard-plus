import { useEffect, useState } from 'react';
import logoSrc from '@/assets/logo-rastremix.png';

interface Logo3DProps {
  size?: number;
  className?: string;
  animated?: boolean;
  glowColor?: string;
}

export function Logo3D({ 
  size = 120, 
  className = '',
  animated = true,
  glowColor = 'primary'
}: Logo3DProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!animated) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [animated]);

  const glowColors: Record<string, { primary: string; secondary: string }> = {
    primary: { primary: 'rgba(234, 88, 12, 0.8)', secondary: 'rgba(234, 88, 12, 0.4)' },
    white: { primary: 'rgba(255, 255, 255, 0.8)', secondary: 'rgba(255, 255, 255, 0.4)' },
    blue: { primary: 'rgba(59, 130, 246, 0.8)', secondary: 'rgba(59, 130, 246, 0.4)' },
    purple: { primary: 'rgba(168, 85, 247, 0.8)', secondary: 'rgba(168, 85, 247, 0.4)' },
  };

  const colors = glowColors[glowColor] || glowColors.primary;

  const style: React.CSSProperties = animated ? {
    '--mouse-x': `${mousePos.x}deg`,
    '--mouse-y': `${mousePos.y}deg`,
    transform: `perspective(1000px) rotateX(var(--mouse-y)) rotateY(var(--mouse-x))`,
  } : {};

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer glow rings */}
      <div 
        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${isHovered ? 'opacity-60' : 'opacity-30'}`}
        style={{
          background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
          filter: 'blur(20px)',
          animation: animated ? 'pulse 3s ease-in-out infinite' : 'none',
        }}
      />
      
      {/* Secondary glow */}
      <div 
        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${isHovered ? 'opacity-80' : 'opacity-40'}`}
        style={{
          background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 60%)`,
          filter: 'blur(10px)',
          transform: 'scale(1.1)',
        }}
      />

      {/* 3D Card container */}
      <div 
        className="relative w-full h-full"
        style={style}
      >
        {/* Glass effect background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl" />
        
        {/* Inner highlight */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/20" />
        
        {/* Logo image */}
        <div className="absolute inset-2 flex items-center justify-center">
          <img 
            src={logoSrc} 
            alt="Logo" 
            className={`max-w-full max-h-full object-contain drop-shadow-2xl ${isHovered ? 'scale-105' : 'scale-100'} transition-transform duration-300`}
            style={{ 
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            }}
          />
        </div>

        {/* Shine effect */}
        <div 
          className={`absolute inset-0 rounded-2xl overflow-hidden pointer-events-none transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <div 
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
              transform: 'translateX(-100%)',
              animation: 'shine 1.5s ease-out forwards',
            }}
          />
        </div>
      </div>

      {/* Floating particles */}
      {animated && (
        <>
          <div 
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              top: '10%',
              left: '20%',
              animation: `float1 ${2 + Math.random()}s ease-in-out infinite`,
              boxShadow: `0 0 10px ${colors.primary}`,
            }}
          />
          <div 
            className="absolute w-1.5 h-1.5 bg-primary/60 rounded-full"
            style={{
              top: '80%',
              left: '70%',
              animation: `float2 ${2.5 + Math.random()}s ease-in-out infinite`,
              boxShadow: `0 0 8px ${colors.secondary}`,
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              top: '50%',
              left: '90%',
              animation: `float3 ${3 + Math.random()}s ease-in-out infinite`,
              boxShadow: `0 0 6px ${colors.secondary}`,
            }}
          />
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          50% { transform: translate(10px, -15px) scale(1.2); opacity: 0.6; }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(-15px, -10px) scale(1.3); opacity: 1; }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); opacity: 0.4; }
          50% { transform: translate(8px, -20px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export function LogoAnimated({ className = '' }: { className?: string }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Multiple layered logos */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ 
          opacity: phase === 0 ? 1 : 0.3,
          transform: `scale(${phase === 0 ? 1 : 0.9})`,
          filter: `blur(${phase === 0 ? 0 : 4}px)`,
        }}
      >
        <Logo3D size={100} animated={false} />
      </div>
      
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ 
          opacity: phase === 1 ? 1 : 0.3,
          transform: `scale(${phase === 1 ? 1 : 0.9})`,
          filter: `blur(${phase === 1 ? 0 : 4}px)`,
        }}
      >
        <Logo3D size={100} animated={false} glowColor="blue" />
      </div>
      
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ 
          opacity: phase === 2 ? 1 : 0.3,
          transform: `scale(${phase === 2 ? 1 : 0.9})`,
          filter: `blur(${phase === 2 ? 0 : 4}px)`,
        }}
      >
        <Logo3D size={100} animated={false} glowColor="purple" />
      </div>

      {/* Active logo on top */}
      <div className="relative z-10">
        <Logo3D size={100} animated={true} />
      </div>
    </div>
  );
}

export function LogoHero() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Background glow */}
      <div 
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'heroPulse 4s ease-in-out infinite',
        }}
      />

      {/* 3D Logo */}
      <Logo3D size={180} animated={true} glowColor="primary" />

      <style>{`
        @keyframes heroPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default Logo3D;
