'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { PARTY_ROLES } from '@/lib/constants';
import { PartyRole } from '@/lib/supabase';

interface RoleStat {
  role: PartyRole;
  count: number;
}

export default function RoleStats() {
  const [stats, setStats] = useState<RoleStat[]>([]);
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!isSupabaseConfigured) {
      const stored = JSON.parse(localStorage.getItem('diwali_guests') || '[]');
      const confirmedGuests = stored.filter((r: { attendance_status: string; payment_method?: string; payment_status?: string }) =>
        r.attendance_status === 'yes' && !!r.payment_method && r.payment_status !== 'rejected'
      );
      setTotalConfirmed(confirmedGuests.length);
      const counts: Record<string, number> = {};
      confirmedGuests.forEach((r: { selected_role: string }) => {
        counts[r.selected_role] = (counts[r.selected_role] || 0) + 1;
      });
      const sorted = Object.entries(counts)
        .map(([role, count]) => ({ role: role as import('@/lib/supabase').PartyRole, count: count as number }))
        .sort((a, b) => b.count - a.count);
      setStats(sorted);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('registrations')
      .select('selected_role, attendance_status, payment_method, payment_status')
      .eq('attendance_status', 'yes')
      .not('payment_method', 'is', null)
      .neq('payment_status', 'rejected');

    if (!error && data) {
      setTotalConfirmed(data.length);

      const counts: Record<string, number> = {};
      data.forEach(r => {
        counts[r.selected_role] = (counts[r.selected_role] || 0) + 1;
      });

      const sorted = Object.entries(counts)
        .map(([role, count]) => ({ role: role as PartyRole, count }))
        .sort((a, b) => b.count - a.count);

      setStats(sorted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('registrations-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const maxCount = stats[0]?.count || 1;

  return (
    <section id="role-stats" className="relative py-24 px-4 sm:px-6 w-full flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-amber-400/60 text-sm tracking-widest uppercase mb-2">Live Stats</p>
          <h2 className="section-title text-4xl sm:text-5xl font-black mb-3">🏆 PARTY CREW</h2>
          <p className="text-amber-300/50">
            {totalConfirmed > 0
              ? `${totalConfirmed} legends have confirmed their chaos 🔥`
              : 'Waiting for the legends to arrive...'}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-4xl animate-spin">🪔</div>
          </div>
        ) : stats.length === 0 ? (
          <div className="glass-card w-full rounded-3xl p-10 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-white/40">Stats will appear once people register!</p>
          </div>
        ) : (
          <div className="glass-card w-full rounded-3xl p-6 sm:p-8 space-y-4">
            {stats.map((stat, idx) => {
              const roleData = PARTY_ROLES[stat.role];
              const pct = (stat.count / maxCount) * 100;
              return (
                <motion.div
                  key={stat.role}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  className="flex items-center gap-4"
                >
                  {/* Emoji + role */}
                  <div className="flex items-center gap-2 w-48 flex-shrink-0">
                    <span className="text-xl">{roleData?.emoji || '🎭'}</span>
                    <div>
                      <p className="text-xs font-bold text-amber-200 leading-tight">
                        {roleData?.title || stat.role}
                      </p>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: idx * 0.08 + 0.2 }}
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                        boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)',
                      }}
                    />
                  </div>

                  {/* Count */}
                  <div className="w-8 text-right">
                    <span className="text-amber-400 font-black text-sm">{stat.count}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
