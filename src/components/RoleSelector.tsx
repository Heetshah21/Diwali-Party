'use client';
import { motion } from 'framer-motion';
import { PARTY_ROLES } from '@/lib/constants';
import { PartyRole } from '@/lib/supabase';

interface RoleSelectorProps {
  selected: PartyRole | null;
  onSelect: (role: PartyRole) => void;
}

export default function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
  const roles = Object.entries(PARTY_ROLES) as [PartyRole, typeof PARTY_ROLES[PartyRole]][];

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-2">🎭 Pick Your Destiny</h3>
        <p className="text-amber-400/60 text-sm">Every great Diwali party needs a specialist. Choose wisely.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-3.5">
        {roles.map(([key, role], idx) => {
          const isSelected = selected === key;
          return (
            <motion.button
              type="button"
              key={key}
              id={`role-${key}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              whileHover={{
                scale: 1.05,
                rotateZ: [-1, 1][idx % 2],
                y: -4,
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(key)}
              className={`role-card group relative flex flex-col items-center justify-between text-center p-3.5 rounded-2xl
                border cursor-pointer transition-all duration-300 overflow-hidden min-h-[165px]
                ${isSelected
                  ? 'border-amber-400 bg-amber-500/25 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400/50'
                  : 'border-white/10 bg-white/5 hover:border-amber-500/50 hover:bg-white/10'
                }`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''}`} />

              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center z-20 shadow-md shadow-amber-400/50"
                >
                  <span className="text-xs text-black font-extrabold">✓</span>
                </motion.div>
              )}

              {/* Top part: Emoji */}
              <div className="relative z-10 flex flex-col items-center pt-1">
                <div
                  className={`text-4xl mb-2 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}
                  style={isSelected ? { filter: 'drop-shadow(0 0 10px rgba(255,165,0,0.9))' } : {}}
                >
                  {role.emoji}
                </div>
                {/* Title */}
                <p className={`text-xs sm:text-[13px] font-black uppercase tracking-wide leading-tight transition-colors duration-300
                  ${isSelected ? 'text-amber-300' : 'text-white/90 group-hover:text-amber-300'}`}
                >
                  {role.title}
                </p>
              </div>

              {/* Bottom part: Description */}
              <p className="relative z-10 text-[11px] text-white/50 group-hover:text-white/80 transition-colors duration-300 leading-snug mt-2 pb-0.5">
                {role.description}
              </p>

              {/* Glow ring on select */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-400/60 animate-pulse pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className="text-amber-400/70 text-sm">
            {PARTY_ROLES[selected].emoji} <span className="text-amber-300 font-semibold">{PARTY_ROLES[selected].title}</span> — Your mission has officially begun.
          </p>
        </motion.div>
      )}
    </div>
  );
}
