'use client';
import { useEffect } from 'react';

export default function CursorTrail() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 768) return; // Skip on mobile

    const trail: HTMLDivElement[] = [];
    const trailLength = 12;
    let mouseX = 0;
    let mouseY = 0;
    let positions: { x: number; y: number }[] = Array(trailLength).fill({ x: 0, y: 0 });

    // Create trail dots
    for (let i = 0; i < trailLength; i++) {
      const dot = document.createElement('div');
      const size = 10 - i * 0.6;
      const opacity = 1 - i / trailLength;
      dot.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, #FFD700, #FF6B35);
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: opacity 0.1s ease;
        opacity: ${opacity};
        box-shadow: 0 0 ${size * 2}px rgba(255, 165, 0, 0.6);
      `;
      document.body.appendChild(dot);
      trail.push(dot);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);

    let frame: number;
    const animate = () => {
      positions = [{ x: mouseX, y: mouseY }, ...positions.slice(0, trailLength - 1)];
      trail.forEach((dot, i) => {
        dot.style.left = positions[i].x + 'px';
        dot.style.top = positions[i].y + 'px';
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frame);
      trail.forEach(d => d.remove());
    };
  }, []);

  return null;
}
