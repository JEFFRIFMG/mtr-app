import { createClient } from '@/lib/shared/supabase/server';
import { Broker } from '@/types/broker';

export async function getBrokers(): Promise<Broker[]> {
  const supabase = createClient();
  
  // Ambil semua broker yang belum di-soft-delete
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .is('deleted_at', null)
    .order('score', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return [];
  }

  return data as Broker[];
}