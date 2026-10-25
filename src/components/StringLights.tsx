'use client';
import { useState, useEffect } from 'react';

export default function StringLights() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const lightCount = 18;

  return (
    <div className="fixed top-0 left-0 right-0 z-10 pointer-events-none">
      <svg
        width="100%"
        height="80"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* String */}
        <path
          d={`M 0 10 Q 360 35 720 10 Q 1080 -15 1440 10`}
          stroke="#8B4513"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />
        {/* Lights */}
        {Array.from({ length: lightCount }).map((_, i) => {
          const t = i / (lightCount - 1);
          const x = t * 1440;
          // Quadratic bezier y calculation
          const y = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 35 + t * t * 10;
          const colors = ['#FFD700', '#FF6B35', '#FF4D6D', '#C77DFF', '#06D6A0', '#FFB700', '#FF9500'];
          const color = colors[i % colors.length];
          return (
            <g key={i}>
              {/* Wire drop */}
              <line
                x1={x} y1={y}
                x2={x} y2={y + 8}
                stroke="#5D3A1A" strokeWidth="1" opacity="0.6"
              />
              {/* Bulb */}
              <ellipse
                cx={x} cy={y + 14}
                rx="5" ry="7"
                fill={color}
                style={{
                  animation: `lightPulse ${1.2 + (i % 4) * 0.3}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.15}s`,
                  filter: `drop-shadow(0 0 4px ${color})`,
                }}
              />
              {/* Glow */}
              <ellipse
                cx={x} cy={y + 14}
                rx="8" ry="10"
                fill={color}
                opacity="0.25"
                style={{
                  animation: `lightPulse ${1.2 + (i % 4) * 0.3}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
