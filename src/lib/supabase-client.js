import { createClient } from '@supabase/supabase-js';
import { SUPA_URL, SUPA_ANON_KEY } from './storage.js';

export const supabase = createClient(SUPA_URL, SUPA_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
