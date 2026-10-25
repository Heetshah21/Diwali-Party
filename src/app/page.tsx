'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/HeroSection';
import RegistrationForm from '@/components/RegistrationForm';
import GuestBoard from '@/components/GuestBoard';
import RoleStats from '@/components/RoleStats';
import StringLights from '@/components/StringLights';
import FloatingParticles from '@/components/FloatingParticles';
import MusicController from '@/components/MusicController';
import EasterEggToast from '@/components/EasterEggToast';
import CursorTrail from '@/components/CursorTrail';

// Load fireworks dynamically (client only, no SSR)
const FireworksCanvas = dynamic(() => import('@/components/FireworksCanvas'), { ssr: false });

export default function HomePage() {
  const registrationRef = useRef<HTMLDivElement>(null);

  const scrollToRegistration = () => {
    registrationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="relative min-h-screen">
      {/* Background layers */}
      <FireworksCanvas />
      <FloatingParticles />
      <StringLights />
      <CursorTrail />
      <EasterEggToast />

      {/* Hero */}
      <HeroSection onCTAClick={scrollToRegistration} />

      {/* Registration */}
      <div ref={registrationRef} className="w-full flex justify-center">
        <RegistrationForm />
      </div>

      {/* Guest Board */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="section-divider w-full" />
        <GuestBoard />
        <div className="section-divider w-full" />
        <RoleStats />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center border-t border-white/5">
        <div className="flex justify-center gap-4 mb-4">
          {['🪔', '🪔', '🪔'].map((d, i) => (
            <span key={i} className="text-2xl animate-flicker" style={{ animationDelay: `${i * 0.4}s` }}>{d}</span>
          ))}
        </div>
        <p className="text-amber-400/30 text-sm">Made with 🪔 for the most chaotic Diwali party ever</p>
        <p className="text-white/20 text-xs mt-1">9th November • 7 PM Onwards</p>
      </footer>

      {/* Music */}
      <MusicController />

      {/* Style for section dividers */}
      <style jsx>{`
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent);
          margin: 0 5%;
        }
      `}</style>
    </main>
  );
}
