import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

// POST /api/admin/awards/winners/setup
// Body: { year: number, source_year?: number }
//
// Flow:
// - source_year tersedia: copy semua kategori dari source_year ke year baru (broker_uuid NULL)
// - source_year ga ada: insert semua kategori master (is_published=true) ke year baru
//
// Hasil: N row kebuat di award_winners year=X dengan broker_uuid NULL.
// User tinggal assign winner per kategori.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { year, source_year } = body as { year: number; source_year?: number };

  if (!year || isNaN(year)) {
    return NextResponse.json({ error: 'year (number) required' }, { status: 400 });
  }

  const supabase = createClient();

  // Cek apakah tahun ini udah ada winner. Kalau udah ada → blok (biar ga double setup).
  const { count: existingCount, error: checkErr } = await supabase
    .from('award_winners')
    .select('uuid', { count: 'exact', head: true })
    .eq('year', year)
    .is('deleted_at', null);

  if (checkErr) {
    console.error('[admin/awards/winners/setup] check error:', checkErr);
    return NextResponse.json({ error: checkErr.message }, { status: 500 });
  }

  if ((existingCount ?? 0) > 0) {
    return NextResponse.json(
      { error: `Year ${year} is already set up (${existingCount} categories exist)` },
      { status: 409 }
    );
  }

  // Resolve list category_id yang mau di-insert
  let categoryIds: string[] = [];

  if (source_year) {
    // Copy dari source_year
    const { data: sourceWinners, error: srcErr } = await supabase
      .from('award_winners')
      .select('category_id')
      .eq('year', source_year)
      .is('deleted_at', null);

    if (srcErr) {
      console.error('[admin/awards/winners/setup] source year fetch error:', srcErr);
      return NextResponse.json({ error: srcErr.message }, { status: 500 });
    }

    categoryIds = (sourceWinners ?? []).map((w) => w.category_id);

    if (categoryIds.length === 0) {
      return NextResponse.json(
        { error: `Source year ${source_year} has no categories to copy` },
        { status: 400 }
      );
    }
  } else {
    // Insert semua master category yang published
    const { data: masterCats, error: catErr } = await supabase
      .from('award_categories')
      .select('uuid')
      .eq('is_published', true)
      .is('deleted_at', null);

    if (catErr) {
      console.error('[admin/awards/winners/setup] master fetch error:', catErr);
      return NextResponse.json({ error: catErr.message }, { status: 500 });
    }

    categoryIds = (masterCats ?? []).map((c) => c.uuid);

    if (categoryIds.length === 0) {
      return NextResponse.json({ error: 'No master categories found' }, { status: 400 });
    }
  }

  // Bulk insert
  const rows = categoryIds.map((category_id) => ({
    category_id,
    year,
    broker_uuid: null,
  }));

  const { data: inserted, error: insErr } = await supabase
    .from('award_winners')
    .insert(rows)
    .select('uuid');

  if (insErr) {
    console.error('[admin/awards/winners/setup] insert error:', insErr);
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      success: true,
      year,
      inserted_count: inserted?.length ?? 0,
    },
    { status: 201 }
  );
}
