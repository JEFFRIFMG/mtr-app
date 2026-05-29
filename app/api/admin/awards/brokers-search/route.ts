import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

// GET /api/admin/awards/brokers-search?q=fxpro
// Search broker by name. Max 20 result.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();

  const supabase = createClient();

  let query = supabase
    .from('brokers')
    .select('uuid, name, slug, logo_url')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('name', { ascending: true })
    .limit(20);

  if (q.length > 0) {
    // ilike pattern
    query = query.ilike('name', `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[admin/awards/brokers-search] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ brokers: data ?? [] });
}
