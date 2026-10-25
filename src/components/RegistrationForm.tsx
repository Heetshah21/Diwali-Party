'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AttendanceStatus, PartyRole, Contribution, PaymentMethod, PaymentStatus } from '@/lib/supabase';
import RoleSelector from './RoleSelector';
import ContributionSelector from './ContributionSelector';
import PaymentSection from './PaymentSection';
import SuccessCelebration from './SuccessCelebration';

type FormStep = 'form' | 'payment' | 'success';

interface PendingGuest {
  id: string;
  name: string;
  contact?: string | null;
  attendance_status: AttendanceStatus;
  selected_role: PartyRole;
  contribution: string;
  timestamp: string;
}

interface ConfirmedPaymentData {
  name: string;
  role: PartyRole;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_amount: number;
}

export default function RegistrationForm() {
  const [step, setStep] = useState<FormStep>('form');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [attendance, setAttendance] = useState<AttendanceStatus | ''>('');
  const [role, setRole] = useState<PartyRole | null>(null);
  const [contribution, setContribution] = useState<Contribution>('');
  const [guestId, setGuestId] = useState<string>('');
  const [pendingGuest, setPendingGuest] = useState<PendingGuest | null>(null);
  const [confirmedData, setConfirmedData] = useState<ConfirmedPaymentData | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Restore draft if user refreshed on payment step
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('diwali_pending_registration');
      if (saved) {
        const parsed = JSON.parse(saved) as PendingGuest;
        if (parsed?.name && parsed?.selected_role) {
          setName(parsed.name);
          setContact(parsed.contact || '');
          setAttendance(parsed.attendance_status);
          setRole(parsed.selected_role);
          setContribution(parsed.contribution);
          setGuestId(parsed.id);
          setPendingGuest(parsed);
          setStep('payment');
        }
      }
    } catch (e) {
      console.error('Failed to restore pending registration draft', e);
    }
  }, []);

  const attendanceOptions: { value: AttendanceStatus; label: string; emoji: string; desc: string }[] = [
    { value: 'yes', label: 'Hell Yeah 🔥', emoji: '🔥', desc: 'I\'m absolutely coming' },
    { value: 'maybe', label: 'Maybe 👀', emoji: '👀', desc: 'I\'ll try my best' },
    { value: 'no', label: 'Sadly No 😭', emoji: '😭', desc: 'Life hates me' },
  ];

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('We need your name, mysterious stranger 👀');
      return;
    }
    if (!attendance) {
      toast.error('Are you coming or not? 😅');
      return;
    }
    if (attendance === 'no') {
      toast.error('You selected Sadly No 😭. Change to "Hell Yeah" or "Maybe" to secure your spot!');
      return;
    }
    if (!role) {
      toast.error('Pick your party role first!');
      return;
    }

    const currentId = guestId || crypto.randomUUID();
    setGuestId(currentId);

    const guestPayload: PendingGuest = {
      id: currentId,
      name: name.trim(),
      contact: contact.trim() || null,
      attendance_status: attendance,
      selected_role: role,
      contribution: contribution || 'myself',
      timestamp: new Date().toISOString(),
    };

    setPendingGuest(guestPayload);
    try {
      sessionStorage.setItem('diwali_pending_registration', JSON.stringify(guestPayload));
    } catch (e) {
      console.warn('sessionStorage not available', e);
    }

    setStep('payment');

    // Smooth scroll to top of section
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBackToEdit = () => {
    setStep('form');
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePaymentSuccess = (confirmed: ConfirmedPaymentData) => {
    setConfirmedData(confirmed);
    setStep('success');
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (step === 'success' && confirmedData) {
    return (
      <SuccessCelebration
        name={confirmedData.name}
        role={confirmedData.role}
        payment_method={confirmedData.payment_method}
        payment_status={confirmedData.payment_status}
        payment_amount={confirmedData.payment_amount}
      />
    );
  }

  if (step === 'payment' && pendingGuest) {
    return (
      <PaymentSection
        guestData={pendingGuest}
        onBackToEdit={handleBackToEdit}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <section ref={sectionRef} id="registration" className="relative py-24 px-4 sm:px-6 w-full flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-amber-400/70 text-sm tracking-widest uppercase mb-2 font-semibold">The Moment of Truth</p>
          <h2 className="section-title text-4xl sm:text-5xl lg:text-6xl font-black mb-3">🎉 JOIN THE PARTY</h2>
          <p className="text-amber-300/70 text-lg sm:text-xl font-light">So... are you actually coming?</p>
        </motion.div>

        {/* Form card */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card w-full p-6 sm:p-10 rounded-3xl space-y-8"
        >
          <form onSubmit={handleProceedToPayment} className="space-y-8">
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="guest-name">
                Your Name <span className="text-amber-400">*</span>
              </label>
              <input
                id="guest-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="What do people call you at parties?"
                className="form-input"
                maxLength={60}
                autoComplete="given-name"
              />
            </div>

            {/* Contact */}
            <div className="form-group">
              <label className="form-label" htmlFor="guest-contact">
                Contact / Instagram <span className="text-white/40 text-xs font-normal lowercase">(optional)</span>
              </label>
              <input
                id="guest-contact"
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="@yourusername or phone number"
                className="form-input"
                maxLength={80}
              />
            </div>

            {/* Attendance */}
            <div className="form-group">
              <label className="form-label">Are you coming? <span className="text-amber-400">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-2">
                {attendanceOptions.map(opt => (
                  <motion.button
                    type="button"
                    key={opt.value}
                    id={`attendance-${opt.value}`}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setAttendance(opt.value)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 text-center cursor-pointer
                      ${attendance === opt.value
                        ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/50'
                        : 'border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/10'
                      }`}
                  >
                    <span className="text-3xl mb-1.5">{opt.emoji}</span>
                    <span className={`text-sm font-bold ${attendance === opt.value ? 'text-amber-300' : 'text-white/90'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-white/50 mt-1">{opt.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Role selector */}
            <RoleSelector selected={role} onSelect={setRole} />

            {/* Contribution */}
            <ContributionSelector selected={contribution} onSelect={setContribution} />

            {/* Submit button: CONFIRM MY SPOT */}
            <motion.button
              type="submit"
              id="register-submit"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-8 rounded-2xl text-lg font-black tracking-wider transition-all duration-300 submit-button cursor-pointer shadow-lg shadow-amber-500/20"
            >
              🎆 CONFIRM MY SPOT
            </motion.button>

            <p className="text-center text-white/30 text-xs">
              Next step: Secure your ₹500 spot contribution (Online UPI or Cash).
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
