'use client';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  radius: number;
  gravity: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  color: string;
  trail: { x: number; y: number }[];
  exploded: boolean;
  particles: Particle[];
}

const COLORS = [
  '#FFD700', '#FF6B35', '#FF4D6D', '#C77DFF',
  '#F72585', '#FFB700', '#06D6A0', '#FF9500',
  '#FF6F61', '#FFA500',
];

export default function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

    const launchFirework = () => {
      const x = Math.random() * canvas.width;
      const targetY = Math.random() * (canvas.height * 0.55);
      fireworksRef.current.push({
        x, y: canvas.height,
        targetY,
        speed: 4 + Math.random() * 4,
        color: randomColor(),
        trail: [],
        exploded: false,
        particles: [],
      });
    };

    const explode = (fw: Firework) => {
      const count = 60 + Math.floor(Math.random() * 60);
      const color = fw.color;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 1.5 + Math.random() * 3;
        fw.particles.push({
          x: fw.x, y: fw.targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          radius: 1 + Math.random() * 2,
          gravity: 0.06 + Math.random() * 0.04,
        });
      }
    };

    let lastLaunch = 0;

    // Handle massive fireworks event from other components
    const handleMassive = (e: Event) => {
      const count = (e as CustomEvent).detail?.count || 6;
      for (let i = 0; i < count; i++) {
        setTimeout(() => launchFirework(), i * 200);
      }
    };
    window.addEventListener('massiveFireworks', handleMassive);

    const animate = (timestamp: number) => {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (timestamp - lastLaunch > 1800 + Math.random() * 1200) {
        launchFirework();
        lastLaunch = timestamp;
      }

      fireworksRef.current = fireworksRef.current.filter(fw => {
        if (!fw.exploded) {
          fw.trail.push({ x: fw.x, y: fw.y });
          if (fw.trail.length > 8) fw.trail.shift();
          fw.y -= fw.speed;

          // Draw trail
          fw.trail.forEach((pt, i) => {
            const alpha = i / fw.trail.length;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `${fw.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();
          });

          // Draw firework head with glow
          ctx.shadowBlur = 12;
          ctx.shadowColor = fw.color;
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = fw.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (fw.y <= fw.targetY) {
            fw.exploded = true;
            explode(fw);
          }
          return true;
        } else {
          fw.particles = fw.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.alpha -= 0.012;

            if (p.alpha <= 0) return false;

            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();
            ctx.shadowBlur = 0;
            return true;
          });
          return fw.particles.length > 0;
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('massiveFireworks', handleMassive);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}

// Exported function to trigger a massive fireworks burst
export function triggerMassiveFireworks(canvas: HTMLCanvasElement | null, count = 8) {
  if (!canvas) return;
  // This is handled via window event
  window.dispatchEvent(new CustomEvent('massiveFireworks', { detail: { count } }));
}
