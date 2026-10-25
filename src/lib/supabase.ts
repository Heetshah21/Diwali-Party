import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id') &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AttendanceStatus = 'yes' | 'maybe' | 'no';
export type PaymentMethod = 'online' | 'cash';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export type PartyRole =
  | 'photographer'
  | 'house_host'
  | 'games_maniac'
  | 'food_commander'
  | 'dj'
  | 'dance_activator'
  | 'chaos_manager'
  | 'decoration_master'
  | 'snack_supplier'
  | 'strategy_master';

export type Contribution =
  | 'food'
  | 'drinks'
  | 'games'
  | 'music'
  | 'mystery'
  | 'myself'
  | string;

export interface Registration {
  id: string;
  name: string;
  contact?: string | null;
  attendance_status: AttendanceStatus;
  selected_role: PartyRole;
  contribution: Contribution;
  timestamp: string;
  payment_method?: PaymentMethod | null;
  payment_amount?: number;
  payment_status?: PaymentStatus;
  payment_screenshot_url?: string | null;
  payment_submitted_at?: string | null;
  created_at?: string;
}
