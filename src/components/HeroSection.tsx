'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Diya from './Diya';

interface HeroSectionProps {
  onCTAClick: () => void;
}

export default function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative min-h-[105vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-40"
    >
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      {/* Rangoli decorative pattern (SVG) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
            <g key={i} transform={`rotate(${deg} 300 300)`}>
              <ellipse cx="300" cy="180" rx="12" ry="40" fill="#FFD700" />
              <ellipse cx="300" cy="240" rx="8" ry="25" fill="#FF6B35" />
              <circle cx="300" cy="150" r="6" fill="#FF4D6D" />
            </g>
          ))}
          <circle cx="300" cy="300" r="30" fill="none" stroke="#FFD700" strokeWidth="2" />
          <circle cx="300" cy="300" r="60" fill="none" stroke="#FF6B35" strokeWidth="1" opacity="0.5" />
          <circle cx="300" cy="300" r="120" fill="none" stroke="#FFD700" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>

      {/* Decorative diyas on the flanks and bottom corners (leaving center spacious for CTA) */}
      <div className="absolute left-6 sm:left-12 bottom-6 sm:bottom-10 flex gap-4 pointer-events-auto z-10">
        <Diya size="md" id="hero-diya-bl1" />
        <Diya size="lg" id="hero-diya-bl2" />
      </div>
      <div className="absolute right-6 sm:right-12 bottom-6 sm:bottom-10 flex gap-4 pointer-events-auto z-10">
        <Diya size="lg" id="hero-diya-br1" />
        <Diya size="md" id="hero-diya-br2" />
      </div>

      {/* Side diyas */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:block z-10">
        <Diya size="lg" id="left-diya" />
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block z-10">
        <Diya size="lg" id="right-diya" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Pre-title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <Diya size="sm" />
          <p className="text-amber-400/80 text-sm sm:text-base tracking-[0.4em] uppercase font-semibold">
            You&apos;re Invited
          </p>
          <Diya size="sm" />
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="hero-title text-6xl sm:text-8xl lg:text-9xl font-black mb-4 leading-none cursor-pointer select-none"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('titleClick'));
          }}
        >
          DIWALI
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-amber-200 mb-2 tracking-widest">
            HOUSE PARTY
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-6" />
          <p className="text-amber-300/70 text-lg sm:text-xl italic font-light">
            &ldquo;Lights. Food. Games. Chaos. Repeat.&rdquo;
          </p>
        </motion.div>

        {/* Party details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 justify-center items-stretch w-full max-w-4xl px-2"
        >
          <div className="party-detail-card justify-center group">
            <div className="detail-icon">📅</div>
            <div className="text-left">
              <p className="detail-label">Date</p>
              <p className="detail-value text-sm sm:text-base">9th November</p>
            </div>
          </div>
          <div className="party-detail-card justify-center group">
            <div className="detail-icon">⏰</div>
            <div className="text-left">
              <p className="detail-label">Time</p>
              <p className="detail-value text-sm sm:text-base">7 PM Onwards</p>
            </div>
          </div>
          <div className="party-detail-card justify-center group">
            <div className="detail-icon">📍</div>
            <div className="text-left">
              <p className="detail-label">Location</p>
              <p className="detail-value text-amber-400/80 italic text-xs sm:text-sm">Coming Soon...</p>
            </div>
          </div>
          <div className="party-detail-card justify-center group">
            <div className="detail-icon">🥻</div>
            <div className="text-left">
              <p className="detail-label">Dress Code</p>
              <p className="detail-value text-sm sm:text-base text-amber-300">Traditionals</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button with generous breathing space */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-16 sm:mt-20 flex flex-col items-center"
        >
          <div className="relative inline-flex items-center justify-center group">
            {/* Ambient golden halo */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full blur-lg opacity-60 group-hover:opacity-90 transition duration-500 animate-pulse-slow" />
            <button
              id="im-coming-btn"
              onClick={onCTAClick}
              className="cta-button group relative z-10"
            >
              <span className="cta-sparkle text-2xl">✨</span>
              <span className="text-lg sm:text-2xl font-black tracking-widest px-1">I&apos;M COMING</span>
              <span className="cta-sparkle text-2xl">✨</span>
            </button>
          </div>
          <p className="mt-6 text-amber-400/50 text-sm tracking-wider animate-bounce-slow">
            ↓ scroll or click to join the madness ↓
          </p>
        </motion.div>
      </div>
    </section>
  );
}
