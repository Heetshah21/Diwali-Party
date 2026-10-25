'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured, Registration } from '@/lib/supabase';
import { PARTY_ROLES } from '@/lib/constants';

export default function GuestBoard() {
  const [guests, setGuests] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [newestId, setNewestId] = useState<string | null>(null);

  const fetchGuests = async () => {
    if (!isSupabaseConfigured) {
      // Load from localStorage
      const stored = JSON.parse(localStorage.getItem('diwali_guests') || '[]') as Registration[];
      const confirmed = stored
        .filter(g => g.attendance_status === 'yes' && !!g.payment_method && g.payment_status !== 'rejected')
        .reverse();
      setGuests(confirmed.slice(0, 40));
      setLoading(false);
      return;
    }

    // Only show guests who have completed the payment step (cash or online) and are not rejected
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('attendance_status', 'yes')
      .not('payment_method', 'is', null)
      .neq('payment_status', 'rejected')
      .order('timestamp', { ascending: false })
      .limit(40);

    if (!error && data) {
      setGuests(prev => {
        const newGuests = data as Registration[];
        if (prev.length > 0 && newGuests[0]?.id !== prev[0]?.id) {
          setNewestId(newGuests[0]?.id);
          setTimeout(() => setNewestId(null), 3000);
        }
        return newGuests;
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGuests();
    if (!isSupabaseConfigured) return;

    // Subscribe to realtime changes (INSERT, UPDATE)
    const channel = supabase
      .channel('registrations-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchGuests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getPaymentIndicator = (guest: Registration) => {
    if (guest.payment_status === 'verified') {
      return {
        label: '✅ Verified',
        className: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/30',
      };
    }
    if (guest.payment_method === 'cash') {
      return {
        label: '💵 Cash — Pending',
        className: 'text-amber-400 bg-amber-500/15 border-amber-400/30',
      };
    }
    return {
      label: '📱 Online — Verification Pending',
      className: 'text-blue-400 bg-blue-500/15 border-blue-400/30',
    };
  };

  return (
    <section id="guest-board" className="relative py-24 px-4 sm:px-6 w-full flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-amber-400/60 text-sm tracking-widest uppercase mb-2 font-semibold">The Crew</p>
          <h2 className="section-title text-4xl sm:text-5xl font-black mb-3">👥 WHO&apos;S JOINING?</h2>
          <p className="text-amber-300/60 text-base">
            These legends have secured their spot for the chaos
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-amber-400 text-4xl animate-spin">🪔</div>
          </div>
        ) : guests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 px-6 glass-card rounded-3xl max-w-md w-full"
          >
            <div className="text-5xl mb-4">🥺</div>
            <p className="text-amber-300/70 text-lg font-bold">No spots secured yet...</p>
            <p className="text-white/40 text-sm mt-2">
              Be the first legend to complete ₹500 payment and lock in your role!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full">
            <AnimatePresence>
              {guests.map((guest, idx) => {
                const roleData = PARTY_ROLES[guest.selected_role];
                const isNew = guest.id === newestId;
                const paymentInfo = getPaymentIndicator(guest);

                return (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: idx * 0.04, duration: 0.4, type: 'spring', bounce: 0.25 }}
                    className={`guest-card glass-card p-3.5 sm:p-4 rounded-2xl text-center relative overflow-hidden flex flex-col justify-between
                      border transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20
                      ${isNew
                        ? 'border-amber-400 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400/50'
                        : 'border-white/10 hover:border-amber-500/40'
                      }`}
                  >
                    {isNew && (
                      <div className="absolute top-1 right-1 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                        NEW!
                      </div>
                    )}

                    {/* Avatar emoji */}
                    <div>
                      <div className={`text-3xl mb-1.5 transition-transform ${isNew ? 'animate-bounce' : ''}`}>
                        {roleData?.emoji || '🎉'}
                      </div>

                      {/* Name */}
                      <p className="font-bold text-sm text-amber-200 truncate mb-0.5" title={guest.name}>
                        {guest.name}
                      </p>

                      {/* Role */}
                      <p className="text-[10px] text-amber-400/70 font-medium leading-tight mb-2">
                        {roleData?.title || guest.selected_role}
                      </p>
                    </div>

                    {/* Payment status indicator */}
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${paymentInfo.className}`}>
                        {paymentInfo.label}
                      </span>
                    </div>

                    {/* Glow on new */}
                    {isNew && (
                      <div className="absolute inset-0 bg-amber-500/10 rounded-2xl animate-pulse pointer-events-none" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {guests.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mt-8 text-white/40 text-sm"
          >
            🎉 {guests.length} legend{guests.length !== 1 ? 's' : ''} locked in for the party!
          </motion.p>
        )}
      </div>
    </section>
  );
}
