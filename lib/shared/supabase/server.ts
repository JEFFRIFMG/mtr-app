import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  // Ngambil URL dan Key dari file .env.local
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Karena ini server-side, kita prioritaskan SERVICE_KEY sesuai planning
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key is missing in environment variables (.env.local)');
  }

  // Bikin instance koneksi ke Supabase
  return createSupabaseClient(supabaseUrl, supabaseKey);
}