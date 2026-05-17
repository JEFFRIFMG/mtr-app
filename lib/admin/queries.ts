import { createClient } from '@/lib/shared/supabase/server';
import { Broker } from '@/types/broker';

/**
 * Ambil semua broker (termasuk soft-deleted, buat admin view).
 */
export async function getAllBrokersAdmin(): Promise<Broker[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .order('rank', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Admin fetch error:', error.message);
    return [];
  }
  return data as Broker[];
}

export async function getBrokerByUuid(uuid: string): Promise<Broker | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('uuid', uuid)
    .maybeSingle();

  if (error) {
    console.error('Get broker error:', error.message);
    return null;
  }
  return data as Broker | null;
}

export async function getAdminStats() {
  const supabase = createClient();
  const [total, active, deleted, published, hidden] = await Promise.all([
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }),
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }).not('deleted_at', 'is', null),
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }).is('deleted_at', null).eq('is_published', true),
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }).is('deleted_at', null).eq('is_published', false),
  ]);
  return {
    total: total.count || 0,
    active: active.count || 0,
    deleted: deleted.count || 0,
    published: published.count || 0,
    hidden: hidden.count || 0,
  };
}
