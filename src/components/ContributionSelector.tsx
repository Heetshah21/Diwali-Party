'use client';
import { motion } from 'framer-motion';
import { CONTRIBUTIONS } from '@/lib/constants';
import { Contribution } from '@/lib/supabase';
import { useState } from 'react';

interface ContributionSelectorProps {
  selected: Contribution;
  onSelect: (c: Contribution) => void;
}

export default function ContributionSelector({ selected, onSelect }: ContributionSelectorProps) {
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onSelect(customInput.trim());
    }
  };

  return (
    <div>
      <h4 className="text-lg font-semibold text-amber-300 mb-1">🔥 What are you bringing?</h4>
      <p className="text-amber-400/50 text-xs mb-4">No judgment. Unless it&apos;s nothing.</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {CONTRIBUTIONS.map((c) => (
          <motion.button
            key={c.value}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { onSelect(c.value); setShowCustom(false); }}
            id={`contribution-${c.value}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200
              ${selected === c.value
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-white/5 border-white/10 text-white/70 hover:border-amber-500/40 hover:bg-white/10'
              }`}
          >
            <span>{c.emoji}</span>
            <span>{c.label}</span>
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCustom(!showCustom)}
          id="contribution-custom"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200
            ${showCustom
              ? 'bg-purple-500/20 border-purple-400 text-purple-300'
              : 'bg-white/5 border-white/10 text-white/70 hover:border-purple-500/40'
            }`}
        >
          <span>✏️</span>
          <span>Custom</span>
        </motion.button>
      </div>

      {showCustom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
            placeholder="e.g. Vibes, my dog, chaos..."
            className="flex-1 form-input text-sm"
            maxLength={50}
          />
          <button
            onClick={handleCustomSubmit}
            className="px-3 py-2 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300 text-sm hover:bg-amber-500/30 transition-all"
          >
            Set
          </button>
        </motion.div>
      )}

      {selected && !CONTRIBUTIONS.find(c => c.value === selected) && !showCustom && (
        <p className="text-purple-300 text-sm mt-2">✏️ Custom: &quot;{selected}&quot;</p>
      )}
    </div>
  );
}
