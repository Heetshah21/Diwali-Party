'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EasterEggToastProps {}

export default function EasterEggToast({}: EasterEggToastProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [titleClickCount, setTitleClickCount] = useState(0);

  useEffect(() => {
    const handleDiya = () => {
      setMessage("Okay bro, calm down. It's Diwali. 🪔😂");
      setTimeout(() => setMessage(null), 4000);
    };

    const handleTitle = () => {
      setTitleClickCount(prev => {
        const next = prev + 1;
        if (next >= 5) {
          setMessage('🎉 You found the secret. You\'re officially invited to the after-party!');
          setTimeout(() => setMessage(null), 5000);
          return 0;
        }
        return next;
      });
    };

    window.addEventListener('easterEgg', handleDiya as EventListener);
    window.addEventListener('titleClick', handleTitle as EventListener);
    return () => {
      window.removeEventListener('easterEgg', handleDiya as EventListener);
      window.removeEventListener('titleClick', handleTitle as EventListener);
    };
  }, []);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9998]
            bg-black/80 backdrop-blur-xl border border-amber-400/40 rounded-2xl
            px-6 py-4 max-w-sm text-center shadow-2xl shadow-amber-500/20"
        >
          <p className="text-amber-300 font-semibold text-sm">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
