import { PartyRole } from './supabase';

export const PARTY_ROLES: Record<PartyRole, { emoji: string; title: string; description: string; color: string }> = {
  photographer: {
    emoji: '📸',
    title: 'THE PHOTOGRAPHER',
    description: 'Responsible for capturing the evidence.',
    color: 'from-purple-500/30 to-pink-500/30',
  },
  house_host: {
    emoji: '🏠',
    title: 'THE HOUSE HOST',
    description: 'Making sure everyone survives the night.',
    color: 'from-yellow-500/30 to-orange-500/30',
  },
  games_maniac: {
    emoji: '🎮',
    title: 'THE GAMES MANIAC',
    description: 'Will turn every gathering into a tournament.',
    color: 'from-blue-500/30 to-cyan-500/30',
  },
  food_commander: {
    emoji: '👨‍🍳',
    title: 'THE FOOD COMMANDER',
    description: 'Food is not a side quest. Food is the main quest.',
    color: 'from-red-500/30 to-orange-500/30',
  },
  dj: {
    emoji: '🎧',
    title: 'THE DJ',
    description: 'Responsible for questionable music choices.',
    color: 'from-indigo-500/30 to-purple-500/30',
  },
  dance_activator: {
    emoji: '🕺',
    title: 'THE DANCE FLOOR ACTIVATOR',
    description: 'Will somehow convince everyone to dance.',
    color: 'from-pink-500/30 to-rose-500/30',
  },
  chaos_manager: {
    emoji: '🕵️',
    title: 'THE CHAOS MANAGER',
    description: 'Has absolutely no idea what they\'re doing.',
    color: 'from-gray-500/30 to-slate-500/30',
  },
  decoration_master: {
    emoji: '🪔',
    title: 'DIWALI DECORATION MASTER',
    description: 'Because someone has to make the place look good.',
    color: 'from-amber-500/30 to-yellow-500/30',
  },
  snack_supplier: {
    emoji: '🍿',
    title: 'SNACK SUPPLIER',
    description: 'Arrives carrying suspicious amounts of snacks.',
    color: 'from-lime-500/30 to-green-500/30',
  },
  strategy_master: {
    emoji: '🧠',
    title: 'STRATEGY MASTER',
    description: 'Will take every game unnecessarily seriously.',
    color: 'from-teal-500/30 to-cyan-500/30',
  },
};

export const CONTRIBUTIONS = [
  { value: 'food', emoji: '🍕', label: 'Food' },
  { value: 'drinks', emoji: '🥤', label: 'Drinks' },
  { value: 'games', emoji: '🎮', label: 'Games' },
  { value: 'music', emoji: '🎵', label: 'Music' },
  { value: 'mystery', emoji: '🎁', label: 'Something mysterious' },
  { value: 'myself', emoji: '😎', label: 'Just myself' },
];

export const PAYMENT_CONFIG = {
  amount: 500,
  currency: 'INR',
  currencySymbol: '₹',
  upiId: process.env.NEXT_PUBLIC_UPI_ID || 'diwaliparty@upi',
  payeeName: process.env.NEXT_PUBLIC_PAYEE_NAME || 'Diwali House Party',
  note: 'Diwali Party Contribution',
};

