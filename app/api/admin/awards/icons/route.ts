import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

// GET /api/admin/awards/icons
// List semua icon master untuk picker.
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('award_icons')
    .select('uuid, slug, label, svg, category, sort_order')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[admin/awards/icons GET] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ icons: data ?? [] });
}
