'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase, Registration, PaymentStatus } from '@/lib/supabase';
import { PARTY_ROLES, CONTRIBUTIONS } from '@/lib/constants';

const ADMIN_PASSWORD = 'diwali2024admin';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [guests, setGuests] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment filtering & modal state
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending_online' | 'cash' | 'verified' | 'rejected'>('all');
  const [previewScreenshot, setPreviewScreenshot] = useState<{ url: string; guestName: string; guestId: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      fetchGuests();
    } else {
      setError('Wrong password. The chaos manager has blocked you.');
    }
  };

  const fetchGuests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setGuests(data as Registration[]);
    }
    setLoading(false);
  };

  const handleUpdatePaymentStatus = async (guestId: string, status: PaymentStatus) => {
    setActionLoadingId(guestId);
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ payment_status: status })
        .eq('id', guestId);

      if (error) throw error;

      toast.success(`Payment marked as ${status.toUpperCase()}!`);
      // Update local state immediately for responsive feel
      setGuests(prev =>
        prev.map(g => (g.id === guestId ? { ...g, payment_status: status } : g))
      );
      if (previewScreenshot?.guestId === guestId) {
        setPreviewScreenshot(null);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Update failed: ${msg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Stats calculation
  const confirmed = guests.filter(g => g.attendance_status === 'yes');
  const maybe = guests.filter(g => g.attendance_status === 'maybe');
  const declined = guests.filter(g => g.attendance_status === 'no');

  // Payment stats
  const paidRegistrations = guests.filter(g => !!g.payment_method);
  const onlinePending = guests.filter(g => g.payment_method === 'online' && g.payment_status === 'pending');
  const cashPending = guests.filter(g => g.payment_method === 'cash' && g.payment_status === 'pending');
  const verifiedPayments = guests.filter(g => g.payment_status === 'verified');
  const rejectedPayments = guests.filter(g => g.payment_status === 'rejected');
  const totalVerifiedAmount = verifiedPayments.reduce((acc, g) => acc + (Number(g.payment_amount) || 500), 0);
  const totalPledgedAmount = guests
    .filter(g => !!g.payment_method && g.payment_status !== 'rejected')
    .reduce((acc, g) => acc + (Number(g.payment_amount) || 500), 0);

  // Role distribution
  const roleCounts: Record<string, number> = {};
  guests.forEach(g => {
    roleCounts[g.selected_role] = (roleCounts[g.selected_role] || 0) + 1;
  });

  // Filtered payments list
  const filteredPayments = paidRegistrations.filter(g => {
    if (paymentFilter === 'pending_online') return g.payment_method === 'online' && g.payment_status === 'pending';
    if (paymentFilter === 'cash') return g.payment_method === 'cash';
    if (paymentFilter === 'verified') return g.payment_status === 'verified';
    if (paymentFilter === 'rejected') return g.payment_status === 'rejected';
    return true;
  });

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 max-w-md w-full border border-amber-400/20"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-2xl font-black text-amber-300 mb-2">Host Dashboard</h1>
            <p className="text-white/40 text-sm">Only the chaos manager can enter.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="form-input w-full"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 submit-button rounded-xl font-bold cursor-pointer"
            >
              Enter the Party Control Room
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 mb-2">
            🎉 PARTY COMMAND CENTER
          </h1>
          <p className="text-white/40 text-sm">
            Last refreshed: {new Date().toLocaleTimeString()}
            <button onClick={fetchGuests} className="ml-3 text-amber-400 hover:text-amber-300 underline text-xs cursor-pointer">
              Refresh
            </button>
          </p>
        </div>

        {/* Payment Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 text-center"
          >
            <div className="text-3xl mb-1">💰</div>
            <div className="text-3xl font-black text-emerald-400">₹{totalVerifiedAmount}</div>
            <div className="text-xs text-emerald-300/80 mt-1 font-semibold">Verified Collected</div>
            <div className="text-[10px] text-white/40 mt-0.5">₹{totalPledgedAmount} total pledged</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card rounded-2xl p-5 border border-blue-500/30 bg-gradient-to-br from-blue-500/15 to-blue-600/5 text-center relative"
          >
            {onlinePending.length > 0 && (
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
              </span>
            )}
            <div className="text-3xl mb-1">📱</div>
            <div className="text-3xl font-black text-blue-400">{onlinePending.length}</div>
            <div className="text-xs text-blue-300/80 mt-1 font-semibold">Online Pending Proofs</div>
            <div className="text-[10px] text-white/40 mt-0.5">Needs host verification</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-amber-600/5 text-center"
          >
            <div className="text-3xl mb-1">💵</div>
            <div className="text-3xl font-black text-amber-400">{cashPending.length}</div>
            <div className="text-xs text-amber-300/80 mt-1 font-semibold">Cash at Door</div>
            <div className="text-[10px] text-white/40 mt-0.5">₹{cashPending.length * 500} to collect</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-5 border border-purple-500/30 bg-gradient-to-br from-purple-500/15 to-purple-600/5 text-center"
          >
            <div className="text-3xl mb-1">📋</div>
            <div className="text-3xl font-black text-purple-300">{confirmed.length}</div>
            <div className="text-xs text-purple-300/80 mt-1 font-semibold">Confirmed Guests</div>
            <div className="text-[10px] text-white/40 mt-0.5">{guests.length} total registrations</div>
          </motion.div>
        </div>

        {/* Dedicated 💳 PAYMENTS Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-400/30 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">💳</span>
                <h2 className="text-2xl font-black text-amber-300">PAYMENTS & VERIFICATION</h2>
              </div>
              <p className="text-white/40 text-xs mt-1">
                Verify screenshot proofs for online payments or manage cash collections.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: `All (${paidRegistrations.length})` },
                { id: 'pending_online', label: `📱 Online Pending (${onlinePending.length})` },
                { id: 'cash', label: `💵 Cash (${cashPending.length})` },
                { id: 'verified', label: `✅ Verified (${verifiedPayments.length})` },
                { id: 'rejected', label: `❌ Rejected (${rejectedPayments.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPaymentFilter(tab.id as typeof paymentFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === tab.id
                      ? 'bg-amber-400 text-black shadow'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payments Table */}
          {loading ? (
            <div className="text-center py-10 text-amber-400 animate-spin text-3xl">🪔</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              No payments match the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Guest Name', 'Role', 'Method', 'Amount', 'Status', 'Screenshot', 'Date / Time', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-amber-400/70 text-xs uppercase tracking-wider font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(g => {
                    const roleData = PARTY_ROLES[g.selected_role];
                    const isOnline = g.payment_method === 'online';
                    const isCash = g.payment_method === 'cash';
                    const isActionLoading = actionLoadingId === g.id;

                    const statusBadge = () => {
                      if (g.payment_status === 'verified') {
                        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">✅ Verified</span>;
                      }
                      if (g.payment_status === 'rejected') {
                        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 border border-red-400/40 text-red-300">❌ Rejected</span>;
                      }
                      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/20 border border-yellow-400/40 text-yellow-300">⏳ Pending</span>;
                    };

                    return (
                      <tr key={g.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        {/* Name & Contact */}
                        <td className="py-3 px-3">
                          <p className="font-bold text-amber-200">{g.name}</p>
                          {g.contact && <p className="text-[11px] text-white/40">{g.contact}</p>}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3 text-xs text-white/70">
                          {roleData?.emoji} {roleData?.title || g.selected_role}
                        </td>

                        {/* Method */}
                        <td className="py-3 px-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isOnline ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {isOnline ? '📱 Online (UPI)' : '💵 Cash'}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3 font-mono font-bold text-amber-300">
                          ₹{g.payment_amount || 500}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {statusBadge()}
                        </td>

                        {/* Screenshot */}
                        <td className="py-3 px-3">
                          {g.payment_screenshot_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewScreenshot({
                                url: g.payment_screenshot_url!,
                                guestName: g.name,
                                guestId: g.id,
                              })}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-amber-500/20 border border-white/20 hover:border-amber-400/50 text-xs text-amber-300 font-semibold cursor-pointer transition-all flex items-center gap-1"
                            >
                              🔍 View Proof
                            </button>
                          ) : (
                            <span className="text-white/30 text-xs">{isCash ? 'N/A (Cash)' : 'None'}</span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-3 text-white/40 text-xs">
                          {g.payment_submitted_at
                            ? new Date(g.payment_submitted_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                            : new Date(g.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {g.payment_status !== 'verified' && (
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleUpdatePaymentStatus(g.id, 'verified')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                                title="Verify Payment"
                              >
                                ✅ Verify
                              </button>
                            )}

                            {g.payment_status !== 'rejected' && (
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleUpdatePaymentStatus(g.id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 text-xs font-bold transition-all cursor-pointer"
                                title="Reject Payment"
                              >
                                ❌ Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Role distribution */}
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-xl font-black text-amber-300 mb-4">🎭 Role Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(roleCounts).sort(([, a], [, b]) => b - a).map(([role, count]) => {
              const roleData = PARTY_ROLES[role as keyof typeof PARTY_ROLES];
              return (
                <div key={role} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <div className="text-2xl mb-1">{roleData?.emoji || '🎭'}</div>
                  <div className="text-amber-400 font-black text-xl">{count}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{roleData?.title || role}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Guest List */}
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-xl font-black text-amber-300 mb-4">📋 Complete Registrations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Name', 'Contact', 'Status', 'Role', 'Bringing', 'Payment', 'Registered'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-amber-400/60 text-xs uppercase tracking-wider font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guests.map(g => {
                  const roleData = PARTY_ROLES[g.selected_role];
                  return (
                    <tr key={g.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-semibold text-amber-200">{g.name}</td>
                      <td className="py-3 px-3 text-white/40 text-xs">{g.contact || '—'}</td>
                      <td className="py-3 px-3 text-xs font-semibold">
                        {g.attendance_status === 'yes' && <span className="text-green-400">🔥 Coming</span>}
                        {g.attendance_status === 'maybe' && <span className="text-yellow-400">👀 Maybe</span>}
                        {g.attendance_status === 'no' && <span className="text-red-400">😭 No</span>}
                      </td>
                      <td className="py-3 px-3 text-xs text-white/60">
                        {roleData?.emoji} {roleData?.title || g.selected_role}
                      </td>
                      <td className="py-3 px-3 text-white/50 text-xs">
                        {CONTRIBUTIONS.find(c => c.value === g.contribution)?.label || g.contribution}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {g.payment_method ? (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            g.payment_status === 'verified' ? 'text-emerald-400 bg-emerald-500/10' :
                            g.payment_status === 'rejected' ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'
                          }`}>
                            {g.payment_method.toUpperCase()} ({g.payment_status || 'pending'})
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs">Not started</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-white/30 text-xs">
                        {new Date(g.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      <AnimatePresence>
        {previewScreenshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card max-w-lg w-full rounded-3xl p-6 border border-amber-400/40 space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-amber-300 text-lg">Payment Proof</h3>
                  <p className="text-xs text-white/50">{previewScreenshot.guestName}&apos;s ₹500 Screenshot</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewScreenshot(null)}
                  className="text-white/50 hover:text-white text-xl p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Image Preview */}
              <div className="bg-black/60 rounded-2xl p-2 flex items-center justify-center max-h-[60vh] overflow-auto">
                <img
                  src={previewScreenshot.url}
                  alt="Payment screenshot proof"
                  className="max-h-[55vh] w-auto rounded-xl object-contain"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleUpdatePaymentStatus(previewScreenshot.guestId, 'rejected')}
                  className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 text-sm font-bold transition-all cursor-pointer"
                >
                  ❌ Reject Payment
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdatePaymentStatus(previewScreenshot.guestId, 'verified')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-sm font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/30"
                >
                  ✅ Verify Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
