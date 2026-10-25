'use client';
import { useEffect, useRef } from 'react';

export default function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'floating-particle';
      const size = 2 + Math.random() * 4;
      const colors = ['#FFD700', '#FF6B35', '#FFA500', '#FF4D6D', '#C77DFF', '#FFB700'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      el.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        opacity: ${0.3 + Math.random() * 0.5};
        animation: floatParticle ${8 + Math.random() * 12}s linear infinite;
        animation-delay: ${-Math.random() * 15}s;
        box-shadow: 0 0 ${size * 2}px ${color};
        pointer-events: none;
        z-index: 1;
      `;
      container.appendChild(el);
      particles.push(el);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-1 overflow-hidden" />;
}
