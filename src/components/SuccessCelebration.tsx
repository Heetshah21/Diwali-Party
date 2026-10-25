'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PARTY_ROLES } from '@/lib/constants';
import { PartyRole, PaymentMethod, PaymentStatus } from '@/lib/supabase';
import Diya from './Diya';

interface SuccessCelebrationProps {
  name: string;
  role: PartyRole;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  payment_amount?: number;
}

export default function SuccessCelebration({
  name,
  role,
  payment_method = 'online',
  payment_status = 'pending',
  payment_amount = 500,
}: SuccessCelebrationProps) {
  const roleData = PARTY_ROLES[role];
  const [showCard, setShowCard] = useState(false);
  const hasRun = useRef(false);

  const launchFireworks = () => {
    // Multi-burst confetti fireworks
    const colors = ['#FFD700', '#FF6B35', '#FF4D6D', '#C77DFF', '#FFB700', '#FFA500', '#10B981'];

    const burst = (x: number, y: number, delay: number, particleCount = 100) => {
      setTimeout(() => {
        confetti({
          particleCount,
          spread: 90,
          origin: { x, y },
          colors,
          ticks: 350,
          gravity: 0.75,
          scalar: 1.2,
          shapes: ['circle', 'square'],
        });
      }, delay);
    };

    // Major celebratory firework show
    burst(0.5, 0.4, 0, 140);
    burst(0.2, 0.45, 250, 100);
    burst(0.8, 0.45, 500, 100);
    burst(0.35, 0.3, 750, 110);
    burst(0.65, 0.3, 1000, 110);
    burst(0.5, 0.25, 1300, 160);

    // Golden rain
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 160,
        origin: { x: 0.5, y: 0 },
        colors: ['#FFD700', '#FFA500', '#FFB700'],
        ticks: 550,
        gravity: 0.6,
        scalar: 1.0,
        drift: 0.2,
      });
    }, 1600);

    // Dispatch massive fireworks canvas event (triggers custom FireworksCanvas)
    window.dispatchEvent(new CustomEvent('massiveFireworks', { detail: { count: 12 } }));
  };

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    setTimeout(launchFireworks, 350);
    setTimeout(() => setShowCard(true), 750);
  }, []);

  const handleBackToParty = () => {
    const el = document.getElementById('guest-board');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPaymentBadge = () => {
    if (payment_method === 'cash') {
      return {
        label: '💵 Cash — Pending',
        bg: 'bg-amber-500/15 border-amber-400/40 text-amber-300',
        note: 'Payment of ₹500 will be collected in cash at the door.',
      };
    }
    if (payment_status === 'verified') {
      return {
        label: '✅ Online — Verified',
        bg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300',
        note: 'Payment verified by the host!',
      };
    }
    return {
      label: '📱 Online — Verification Pending',
      bg: 'bg-blue-500/20 border-blue-400/40 text-blue-300',
      note: 'Screenshot submitted! Host will verify shortly.',
    };
  };

  const badge = getPaymentBadge();

  return (
    <section id="success" className="relative py-20 px-4 min-h-screen flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={showCard ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.35 }}
        className="glass-card p-8 sm:p-12 rounded-3xl max-w-lg w-full text-center relative overflow-hidden"
      >
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-3xl ring-2 ring-amber-400/50 animate-pulse pointer-events-none" />

        {/* Diyas */}
        <div className="flex justify-center gap-6 mb-6">
          <Diya size="md" />
          <Diya size="lg" />
          <Diya size="md" />
        </div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={showCard ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 mb-2">
            🎉 YOU&apos;RE IN!
          </h2>
        </motion.div>

        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showCard ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <p className="text-xl sm:text-2xl font-bold text-amber-200 mb-1">
            Welcome to the chaos,
          </p>
          <p className="text-3xl font-black text-amber-400 mb-6">{name}! 🪔</p>
        </motion.div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mb-6" />

        {/* Summary Card: Role, Contribution, Payment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={showCard ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="space-y-3 mb-6"
        >
          {/* Party Role */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Party Role</p>
              <p className="text-amber-300 font-black text-base">{roleData?.title || role}</p>
            </div>
            <div className="text-3xl">{roleData?.emoji || '🎉'}</div>
          </div>

          {/* Contribution */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Contribution</p>
              <p className="text-amber-400 font-black text-xl">₹{payment_amount}</p>
            </div>
            <div className="text-2xl">🎟️</div>
          </div>

          {/* Payment Status Badge */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">Payment</p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${badge.bg}`}>
              {badge.label}
            </div>
            <p className="text-white/40 text-xs mt-1.5">{badge.note}</p>
          </div>
        </motion.div>

        {/* Playful quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={showCard ? { opacity: 1 } : {}}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="text-amber-300/80 text-sm italic mb-8 border-l-2 border-amber-500/40 pl-4 text-left bg-amber-500/5 py-2 rounded-r-xl"
        >
          &ldquo;Your spot has been reserved. Now don&apos;t disappear before the party.&rdquo;
        </motion.blockquote>

        {/* Button: BACK TO THE PARTY */}
        <motion.button
          id="back-to-party-btn"
          initial={{ opacity: 0, y: 20 }}
          animate={showCard ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.0, duration: 0.6 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleBackToParty}
          className="w-full py-4 submit-button text-lg font-black rounded-2xl cursor-pointer shadow-lg shadow-amber-500/25"
        >
          🪔 BACK TO THE PARTY
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={showCard ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-4 text-white/30 text-xs"
        >
          Check out your spot on the guest board below ↓
        </motion.p>
      </motion.div>
    </section>
  );
}
