import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

// POST /api/admin/awards/winners/remove-group
// Body: { group_id: string, year: number }
//
// Hapus semua row di award_winners yang:
//   - year = tahun tsb
//   - category_id ada di award_categories WHERE group_id = group tsb
//
// Master award_groups & award_categories TIDAK disentuh.
// Tahun lain TIDAK kesentuh karena filter year spesifik.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { group_id, year } = body as { group_id?: string; year?: number };

  if (!group_id || !year || isNaN(year)) {
    return NextResponse.json(
      { error: 'group_id and year (number) are required' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // 1. Resolve list category_id di group tsb
  const { data: cats, error: catErr } = await supabase
    .from('award_categories')
    .select('uuid')
    .eq('group_id', group_id)
    .is('deleted_at', null);

  if (catErr) {
    console.error('[remove-group] cats error:', catErr);
    return NextResponse.json({ error: catErr.message }, { status: 500 });
  }

  const categoryIds = (cats ?? []).map((c) => c.uuid);

  if (categoryIds.length === 0) {
    return NextResponse.json(
      { error: 'Group has no categories', deleted_count: 0 },
      { status: 200 }
    );
  }

  // 2. Bulk delete winner rows di year tsb yang category_id-nya di group ini
  const { data: deleted, error: delErr } = await supabase
    .from('award_winners')
    .delete()
    .eq('year', year)
    .in('category_id', categoryIds)
    .select('uuid');

  if (delErr) {
    console.error('[remove-group] delete error:', delErr);
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    year,
    group_id,
    deleted_count: deleted?.length ?? 0,
  });
}
