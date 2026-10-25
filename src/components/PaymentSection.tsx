'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { supabase, isSupabaseConfigured, PartyRole, PaymentMethod, PaymentStatus, Registration } from '@/lib/supabase';
import { PARTY_ROLES, PAYMENT_CONFIG } from '@/lib/constants';
import Diya from './Diya';

interface PaymentSectionProps {
  guestData: {
    id: string;
    name: string;
    contact?: string | null;
    attendance_status: 'yes' | 'maybe' | 'no';
    selected_role: PartyRole;
    contribution: string;
    timestamp: string;
  };
  onBackToEdit: () => void;
  onPaymentSuccess: (confirmedData: {
    name: string;
    role: PartyRole;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    payment_amount: number;
  }) => void;
}

export default function PaymentSection({
  guestData,
  onBackToEdit,
  onPaymentSuccess,
}: PaymentSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>('online');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [hasCustomQr, setHasCustomQr] = useState(true);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roleData = PARTY_ROLES[guestData.selected_role];
  const upiId = PAYMENT_CONFIG.upiId;
  const amount = PAYMENT_CONFIG.amount;
  const payeeName = PAYMENT_CONFIG.payeeName;
  const customQrPath = process.env.NEXT_PUBLIC_CUSTOM_QR_IMAGE || '/payment-qr.png';

  // Standard UPI URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Diwali Party - ' + guestData.name)}`;

  // Generate QR Code
  useEffect(() => {
    QRCode.toDataURL(upiUri, {
      width: 440,
      margin: 1.5,
      color: {
        dark: '#1C1308',
        light: '#FFFFFF',
      },
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate QR code', err));
  }, [upiUri]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image (PNG, JPG, JPEG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB. Please upload a smaller screenshot.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    toast.success('Screenshot ready! Click submit below.');
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Online Payment Submission
  const handleOnlineSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please upload your payment screenshot first!');
      return;
    }

    setUploading(true);

    try {
      let screenshotUrl: string | null = null;

      if (isSupabaseConfigured) {
        // Sanitize and create unique file path
        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'png';
        const sanitizedGuestName = guestData.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const fileName = `${sanitizedGuestName}_${guestData.id}_${Date.now()}.${fileExt}`;

        // 1. Upload screenshot to Supabase Storage bucket
        const { error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(fileName, selectedFile, {
            contentType: selectedFile.type,
            upsert: true,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error('Screenshot upload failed: ' + uploadError.message);
        }

        // 2. Get public URL
        const { data: publicData } = supabase.storage
          .from('payment-screenshots')
          .getPublicUrl(fileName);

        screenshotUrl = publicData.publicUrl;

        // 3. Save or update registration record
        const registrationRecord: Registration = {
          ...guestData,
          payment_method: 'online',
          payment_amount: amount,
          payment_status: 'pending',
          payment_screenshot_url: screenshotUrl,
          payment_submitted_at: new Date().toISOString(),
        };

        const { error: upsertError } = await supabase
          .from('registrations')
          .upsert([registrationRecord], { onConflict: 'id' });

        if (upsertError) {
          console.error('Database save error:', upsertError);
          throw upsertError;
        }
      } else {
        // Local storage demo fallback
        const existing = JSON.parse(localStorage.getItem('diwali_guests') || '[]');
        const updated = existing.filter((g: Registration) => g.id !== guestData.id);
        updated.push({
          ...guestData,
          payment_method: 'online',
          payment_amount: amount,
          payment_status: 'pending',
          payment_screenshot_url: 'demo-screenshot',
          payment_submitted_at: new Date().toISOString(),
        });
        localStorage.setItem('diwali_guests', JSON.stringify(updated));
        await new Promise(r => setTimeout(r, 800));
      }

      // Clear any session drafts
      sessionStorage.removeItem('diwali_pending_registration');

      onPaymentSuccess({
        name: guestData.name,
        role: guestData.selected_role,
        payment_method: 'online',
        payment_status: 'pending',
        payment_amount: amount,
      });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(`Payment submission error: ${msg}. Try again.`);
    } finally {
      setUploading(false);
    }
  };

  // Cash Payment Submission
  const handleCashSubmit = async () => {
    setUploading(true);

    try {
      const registrationRecord: Registration = {
        ...guestData,
        payment_method: 'cash',
        payment_amount: amount,
        payment_status: 'pending',
        payment_screenshot_url: null,
        payment_submitted_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('registrations')
          .upsert([registrationRecord], { onConflict: 'id' });

        if (error) throw error;
      } else {
        const existing = JSON.parse(localStorage.getItem('diwali_guests') || '[]');
        const updated = existing.filter((g: Registration) => g.id !== guestData.id);
        updated.push(registrationRecord);
        localStorage.setItem('diwali_guests', JSON.stringify(updated));
        await new Promise(r => setTimeout(r, 600));
      }

      sessionStorage.removeItem('diwali_pending_registration');

      onPaymentSuccess({
        name: guestData.name,
        role: guestData.selected_role,
        payment_method: 'cash',
        payment_status: 'pending',
        payment_amount: amount,
      });
    } catch (err) {
      console.error(err);
      toast.error('Could not confirm cash payment. Please try again!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section id="payment-step" className="relative py-16 sm:py-24 px-4 sm:px-6 w-full flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex justify-center gap-3 mb-3">
            <Diya size="sm" />
            <span className="text-amber-400/80 text-sm tracking-widest uppercase font-semibold">
              Step 2 of 2
            </span>
            <Diya size="sm" />
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 mb-2">
            🎟️ ONE LAST THING...
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-amber-200/90 mb-3">
            Secure Your Spot
          </p>

          {/* Guest badge info */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-amber-300/90 mb-6">
            <span>Reserving for <strong className="text-amber-300">{guestData.name}</strong></span>
            <span>•</span>
            <span>{roleData.emoji} {roleData.title}</span>
            <button
              type="button"
              onClick={onBackToEdit}
              className="ml-2 text-xs text-amber-400/70 hover:text-amber-300 underline cursor-pointer"
            >
              Edit
            </button>
          </div>

          {/* Amount Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="glass-card max-w-md mx-auto p-6 rounded-3xl border border-amber-400/30 relative overflow-hidden shadow-2xl shadow-amber-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 pointer-events-none" />
            <p className="text-amber-400/70 text-xs tracking-wider uppercase font-semibold">Party Contribution</p>
            <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500 my-1">
              ₹500
            </div>
            <p className="text-amber-200/80 text-sm italic mt-2">
              &ldquo;Because apparently Diwali parties aren&apos;t free. 😭&rdquo;
            </p>
            <p className="text-white/40 text-[11px] mt-1">
              ₹500 between you and an unforgettable evening.
            </p>
          </motion.div>
        </motion.div>

        {/* Payment Options Selection Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Online Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod('online')}
            className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              selectedMethod === 'online'
                ? 'bg-amber-500/15 border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/40'
                : 'glass-card border-white/10 hover:border-amber-400/40 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">📱</div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                selectedMethod === 'online'
                  ? 'bg-amber-400 text-black font-black'
                  : 'bg-white/10 text-white/50'
              }`}>
                {selectedMethod === 'online' ? 'SELECTED' : 'INSTANT'}
              </span>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-200 mb-1">PAY ONLINE</h3>
              <p className="text-amber-400/80 text-sm font-semibold">Scan & Pay ₹500</p>
              <p className="text-white/40 text-xs mt-2">
                Scan UPI QR via GPay, PhonePe, Paytm or any UPI app & upload proof.
              </p>
            </div>
          </motion.div>

          {/* Cash Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod('cash')}
            className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              selectedMethod === 'cash'
                ? 'bg-amber-500/15 border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/40'
                : 'glass-card border-white/10 hover:border-amber-400/40 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">💵</div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                selectedMethod === 'cash'
                  ? 'bg-amber-400 text-black font-black'
                  : 'bg-white/10 text-white/50'
              }`}>
                {selectedMethod === 'cash' ? 'SELECTED' : 'AT DOOR'}
              </span>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-200 mb-1">PAY IN CASH</h3>
              <p className="text-amber-400/80 text-sm font-semibold">I&apos;ll pay at the party</p>
              <p className="text-white/40 text-xs mt-2">
                Hand over ₹500 in cash when you arrive at the door.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Method Details Section */}
        <AnimatePresence mode="wait">
          {selectedMethod === 'online' ? (
            /* Online Payment Details */
            <motion.div
              key="online-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full glass-card p-6 sm:p-10 rounded-3xl border border-amber-400/20 space-y-8"
            >
              <div className="text-center space-y-1">
                <span className="text-xs uppercase tracking-widest text-amber-400/70 font-bold">Step 1 of Online Payment</span>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-300">Scan the QR Code</h3>
                <p className="text-amber-200/70 font-semibold text-lg">Amount: ₹500</p>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center">
                <div className="relative p-5 sm:p-7 rounded-3xl bg-white shadow-2xl shadow-amber-500/25 border-4 border-amber-400/80 ring-4 ring-amber-400/20 max-w-[320px] sm:max-w-[360px] w-full flex flex-col items-center">
                  {/* Diya badge at top of QR */}
                  <div className="absolute -top-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-[10px] tracking-wider px-3 py-1 rounded-full uppercase shadow">
                    🪔 Diwali UPI QR
                  </div>

                  {hasCustomQr ? (
                    <img
                      src={customQrPath}
                      alt="Diwali Party ₹500 UPI QR Code"
                      onError={() => setHasCustomQr(false)}
                      className="w-full aspect-square rounded-xl object-contain"
                    />
                  ) : qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Diwali Party ₹500 UPI QR Code"
                      className="w-full aspect-square rounded-xl object-contain"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center text-amber-600 animate-spin text-4xl">
                      🪔
                    </div>
                  )}

                  <div className="mt-3 text-center">
                    <span className="text-black font-black text-sm tracking-wide block">
                      SCAN WITH ANY UPI APP
                    </span>
                    <span className="text-gray-500 text-[11px] block mt-0.5">
                      GPay • PhonePe • Paytm • BHIM • CRED
                    </span>
                  </div>
                </div>

                {/* UPI ID Details */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white/80">
                    UPI ID: <strong className="text-amber-300 font-mono tracking-wider">{upiId}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedUpi ? '✓ Copied!' : '📋 Copy UPI ID'}
                  </button>
                </div>

                {/* Direct UPI Intent Link for Mobile */}
                <a
                  href={upiUri}
                  className="mt-3 sm:hidden text-xs text-amber-400 hover:text-amber-300 underline font-semibold"
                >
                  Tap here to open installed UPI app directly
                </a>
              </div>

              {/* Upload Screenshot Section */}
              <div className="border-t border-white/10 pt-8 space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-xs uppercase tracking-widest text-amber-400/70 font-bold">Step 2 of Online Payment</span>
                  <h4 className="text-xl sm:text-2xl font-black text-amber-300">
                    📤 UPLOAD PAYMENT SCREENSHOT
                  </h4>
                  <p className="text-white/50 text-xs sm:text-sm">
                    Upload an image or screenshot of your successful ₹500 payment.
                  </p>
                </div>

                {/* Upload Input Area */}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="screenshot-input"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-400/40 hover:border-amber-400/80 rounded-3xl p-8 text-center cursor-pointer bg-white/5 hover:bg-amber-500/10 transition-all flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-3xl">
                      📸
                    </div>
                    <div>
                      <p className="text-amber-200 font-bold text-base">
                        Tap or Click to Select Screenshot
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        Accepts PNG, JPG, JPEG, WebP (Max 5MB)
                      </p>
                    </div>
                    <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                      Choose Screenshot
                    </span>
                  </motion.div>
                ) : (
                  <div className="p-5 rounded-3xl bg-white/5 border border-amber-400/30 space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-400 animate-ping" />
                        <span className="text-green-400 font-black text-sm tracking-wide">
                          PAYMENT SCREENSHOT READY ✓
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                      >
                        Remove / Replace
                      </button>
                    </div>

                    {/* Preview */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-3 rounded-2xl border border-white/5">
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Payment screenshot preview"
                          className="max-h-48 sm:max-h-36 max-w-full rounded-xl object-contain border border-white/10"
                        />
                      )}
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-200 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Image'}
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline font-medium block"
                        >
                          Change to different image
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Online Payment Button */}
                <motion.button
                  type="button"
                  id="submit-online-payment"
                  disabled={uploading || !selectedFile}
                  onClick={handleOnlineSubmit}
                  whileHover={!uploading && selectedFile ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!uploading && selectedFile ? { scale: 0.98 } : {}}
                  className={`w-full py-4 px-8 rounded-2xl text-lg font-black tracking-wider transition-all duration-300 mt-6 ${
                    uploading || !selectedFile
                      ? 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5'
                      : 'submit-button cursor-pointer shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="animate-spin text-xl">🪔</span>
                      Uploading Screenshot & Securing Spot...
                    </span>
                  ) : selectedFile ? (
                    '🎆 SUBMIT MY PAYMENT'
                  ) : (
                    'Upload Screenshot to Enable Submission'
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* Cash Payment Details */
            <motion.div
              key="cash-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full glass-card p-6 sm:p-10 rounded-3xl border border-amber-400/20 text-center space-y-6"
            >
              <div className="text-5xl">💵</div>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300">Pay In Cash at the Party</h3>

              <div className="max-w-md mx-auto p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200">
                <p className="text-base font-semibold">
                  &ldquo;No problem. Your ₹500 contribution will be collected in cash at the party.&rdquo;
                </p>
                <p className="text-white/50 text-xs mt-2">
                  Please bring exact change if possible so the chaos manager doesn&apos;t panic!
                </p>
              </div>

              <motion.button
                type="button"
                id="confirm-cash-payment"
                disabled={uploading}
                onClick={handleCashSubmit}
                whileHover={!uploading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!uploading ? { scale: 0.98 } : {}}
                className={`w-full max-w-md mx-auto py-4 px-8 rounded-2xl text-lg font-black tracking-wider transition-all duration-300 cursor-pointer ${
                  uploading
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'submit-button shadow-lg shadow-amber-500/20'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="animate-spin text-xl">🪔</span>
                    Confirming Cash Registration...
                  </span>
                ) : (
                  '💵 CONFIRM CASH PAYMENT'
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Link */}
        <button
          type="button"
          onClick={onBackToEdit}
          className="mt-6 text-sm text-white/40 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          ← Go back to edit registration details
        </button>
      </div>
    </section>
  );
}
