import { useState, useEffect } from 'react';
import logoSrc from '@/assets/logo-rastremix.png';

interface Logo3DProps {
  size?: number;
  className?: string;
  animated?: boolean;
  glowColor?: 'primary' | 'white' | 'orange';
}

export function Logo3D({ 
  size = 120, 
  className = '', 
  animated = true,
  glowColor = 'primary'
}: Logo3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    primary: { glow: 'rgba(234, 88, 12, 0.3)', shadow: 'rgba(234, 88, 12, 0.2)' },
    white: { glow: 'rgba(255, 255, 255, 0.3)', shadow: 'rgba(255, 255, 255, 0.2)' },
    orange: { glow: 'rgba(249, 115, 22, 0.3)', shadow: 'rgba(249, 115, 22, 0.2)' },
  }[glowColor];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle glow behind */}
      <div
        className="absolute inset-0 rounded-lg transition-all duration-500"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: 'blur(15px)',
          transform: isHovered ? 'scale(1.3)' : 'scale(1)',
          opacity: isHovered ? 1 : 0.6,
        }}
      />

      {/* Logo image only */}
      <div 
        className="relative transition-all duration-300"
        style={{
          transform: animated && isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <img 
          src={logoSrc} 
          alt="Logo" 
          className="w-full h-full object-contain"
          style={{
            filter: isHovered 
              ? 'drop-shadow(0 0 20px rgba(234, 88, 12, 0.5))' 
              : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            transition: 'filter 0.3s ease',
          }}
        />
      </div>

      {/* Floating particles on hover */}
      {animated && isHovered && (
        <>
          <div 
            className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full"
            style={{
              top: '20%',
              left: '10%',
              animation: 'floatUp 2s ease-in-out infinite',
              boxShadow: `0 0 10px ${colors.shadow}`,
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-orange-400 rounded-full"
            style={{
              bottom: '30%',
              right: '15%',
              animation: 'floatUp 2.5s ease-in-out infinite 0.5s',
              boxShadow: `0 0 8px ${colors.shadow}`,
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-orange-300 rounded-full"
            style={{
              top: '50%',
              right: '5%',
              animation: 'floatUp 1.8s ease-in-out infinite 1s',
              boxShadow: `0 0 6px ${colors.shadow}`,
            }}
          />
        </>
      )}

      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-15px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default Logo3D;
