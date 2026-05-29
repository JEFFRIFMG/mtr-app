import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

// GET /api/admin/awards/meta?year=2027
//
// Return:
// - years: semua tahun yang udah ada di award_winners (untuk dropdown tahun)
// - available_categories: kategori master yang BELUM di-add ke year tsb
//   (untuk modal "Add Category to this Year")
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : null;

  const supabase = createClient();

  // Distinct years
  const { data: yearsData, error: yearsErr } = await supabase
    .from('award_winners')
    .select('year')
    .is('deleted_at', null)
    .order('year', { ascending: false });

  if (yearsErr) {
    console.error('[admin/awards/meta] years error:', yearsErr);
    return NextResponse.json({ error: yearsErr.message }, { status: 500 });
  }

  const years = Array.from(new Set((yearsData ?? []).map((r) => r.year))).sort((a, b) => b - a);

  let available_categories: { uuid: string; title: string; group_name: string }[] = [];

  if (year && !isNaN(year)) {
    // Master categories
    const { data: masterCats, error: mcErr } = await supabase
      .from('award_categories')
      .select(`
        uuid, title, sort_order,
        group:award_groups!award_categories_group_id_fkey ( uuid, name, sort_order )
      `)
      .eq('is_published', true)
      .is('deleted_at', null);

    if (mcErr) {
      console.error('[admin/awards/meta] master cats error:', mcErr);
      return NextResponse.json({ error: mcErr.message }, { status: 500 });
    }

    // Yang sudah ada di tahun ini
    const { data: existing, error: existErr } = await supabase
      .from('award_winners')
      .select('category_id')
      .eq('year', year)
      .is('deleted_at', null);

    if (existErr) {
      console.error('[admin/awards/meta] existing error:', existErr);
      return NextResponse.json({ error: existErr.message }, { status: 500 });
    }

    const existingIds = new Set((existing ?? []).map((w) => w.category_id));

    available_categories = (masterCats ?? [])
      .filter((c) => !existingIds.has(c.uuid))
      .map((c) => {
        // Supabase return relasi sebagai array kalau ga single — handle both
        const grp = Array.isArray(c.group) ? c.group[0] : c.group;
        return {
          uuid: c.uuid,
          title: c.title,
          group_name: grp?.name ?? '',
        };
      });
  }

  return NextResponse.json({
    years,
    available_categories,
  });
}
