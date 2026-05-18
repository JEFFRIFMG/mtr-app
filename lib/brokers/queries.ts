import { createClient } from '@/lib/shared/supabase/server';
import { Broker } from '@/types/broker';
import { client } from '@/sanity/client'; // Pastikan path ini sesuai dengan letak Sanity client lo

export async function getBrokers(): Promise<Broker[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('score', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return [];
  }

  return data as Broker[];
}

export async function getBrokerBySlug(slug: string): Promise<Broker | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .eq('is_published', true)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('Supabase error (getBrokerBySlug):', error.message);
    }
    return null;
  }
  
  return data as Broker;
}

export async function getBrokerReview(uuid: string) {
  try {
    const query = `*[_type == "brokerReview" && brokerUuid == $uuid && status == "published"][0]`;
    const review = await client.fetch(query, { uuid });
    return review;
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return null;
  }
}