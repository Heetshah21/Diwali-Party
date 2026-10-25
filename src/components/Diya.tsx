'use client';
import { useEffect, useRef, useState } from 'react';

interface DiyaProps {
  x?: string;
  y?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export default function Diya({ x = '50%', y = '50%', size = 'md', className = '', id }: DiyaProps) {
  const [clickCount, setClickCount] = useState(0);
  const [isGlowing, setIsGlowing] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const particleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sizeMap = {
    sm: { base: 32, flame: 14 },
    md: { base: 48, flame: 20 },
    lg: { base: 64, flame: 28 },
  };
  const s = sizeMap[size];

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    setIsGlowing(true);
    setShowParticles(true);

    if (particleTimerRef.current) clearTimeout(particleTimerRef.current);
    particleTimerRef.current = setTimeout(() => setShowParticles(false), 800);
    setTimeout(() => setIsGlowing(false), 1200);

    if (newCount >= 5) {
      setClickCount(0);
      window.dispatchEvent(new CustomEvent('massiveFireworks', { detail: { count: 12 } }));
      window.dispatchEvent(new CustomEvent('easterEgg', { detail: { type: 'diya' } }));
    }
  };

  return (
    <div
      id={id}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ width: s.base, height: s.base * 1.4 }}
      onClick={handleClick}
      title="Click me! 🪔"
    >
      {/* Flame */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 0, width: s.flame, height: s.flame * 1.6 }}
      >
        {/* Outer flame glow */}
        <div
          className="absolute inset-0 rounded-full animate-flicker"
          style={{
            background: isGlowing
              ? 'radial-gradient(ellipse at 50% 80%, #FFD700 0%, #FF6B35 50%, transparent 100%)'
              : 'radial-gradient(ellipse at 50% 80%, #FFA500 0%, #FF6B35 60%, transparent 100%)',
            filter: `blur(${isGlowing ? 6 : 3}px)`,
            opacity: isGlowing ? 1 : 0.85,
            transform: 'scaleX(0.7)',
            boxShadow: isGlowing
              ? `0 0 ${s.flame * 2}px ${s.flame}px rgba(255,165,0,0.6)`
              : `0 0 ${s.flame}px ${s.flame / 2}px rgba(255,165,0,0.3)`,
            transition: 'all 0.3s ease',
          }}
        />
        {/* Inner flame core */}
        <div
          className="absolute left-1/2 -translate-x-1/2 animate-flicker2"
          style={{
            bottom: '15%',
            width: s.flame * 0.4,
            height: s.flame * 0.7,
            background: 'radial-gradient(ellipse, #FFFDE7 0%, #FFF9C4 50%, transparent 100%)',
            borderRadius: '50% 50% 40% 40%',
            filter: 'blur(1px)',
          }}
        />
      </div>

      {/* Wick */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-amber-900 rounded-full"
        style={{
          top: s.flame * 1.4,
          width: 2,
          height: s.base * 0.12,
        }}
      />

      {/* Diya body */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: s.base,
          height: s.base * 0.4,
        }}
      >
        <svg
          viewBox="0 0 100 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          {/* Diya bowl */}
          <ellipse cx="50" cy="15" rx="46" ry="14" fill="#C2591A" />
          <ellipse cx="50" cy="13" rx="40" ry="10" fill="#D4692A" />
          <ellipse cx="50" cy="11" rx="34" ry="7" fill="#8B4513" opacity="0.5" />
          {/* Oil surface glow */}
          <ellipse cx="50" cy="10" rx="28" ry="5"
            fill={isGlowing ? '#FFD700' : '#FFA500'} opacity={isGlowing ? 0.6 : 0.3} />
          {/* Base */}
          <path d="M 15 20 Q 50 45 85 20" fill="#A0522D" />
          {/* Decorative lines */}
          <line x1="30" y1="18" x2="25" y2="30" stroke="#CD853F" strokeWidth="1" opacity="0.6" />
          <line x1="50" y1="20" x2="50" y2="34" stroke="#CD853F" strokeWidth="1" opacity="0.6" />
          <line x1="70" y1="18" x2="75" y2="30" stroke="#CD853F" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>

      {/* Glow aura */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,165,0,0.4) 0%, transparent 70%)',
          filter: `blur(${isGlowing ? 12 : 6}px)`,
          opacity: isGlowing ? 1 : 0.5,
          transition: 'all 0.3s ease',
        }}
      />

      {/* Particles on click */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-particle"
              style={{
                left: '50%',
                top: '20%',
                background: ['#FFD700', '#FF6B35', '#FFA500', '#FF4D6D', '#FFB700', '#FF9500'][i],
                '--angle': `${i * 60}deg`,
                '--dist': `${20 + Math.random() * 20}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}
