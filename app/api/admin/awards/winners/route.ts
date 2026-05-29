import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

// GET /api/admin/awards/winners?year=2027
// Return semua kategori + winner per tahun tsb.
// Kalau year ga ada → return empty list (FE bisa decide nampilin "Setup Season").
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : null;

  if (!year || isNaN(year)) {
    return NextResponse.json({ error: 'year query param required' }, { status: 400 });
  }

  const supabase = createClient();

  // Ambil winner di tahun tsb, join ke kategori + broker
  const { data, error } = await supabase
    .from('award_winners')
    .select(`
      uuid, category_id, broker_uuid, year, announced_at,
      category:award_categories!award_winners_category_id_fkey (
        uuid, slug, title, description, sort_order, group_id,
        group:award_groups!award_categories_group_id_fkey (
          uuid, name, sort_order
        )
      ),
      broker:brokers!award_winners_broker_uuid_fkey (
        uuid, name, slug, logo_url
      )
    `)
    .eq('year', year)
    .is('deleted_at', null);

  if (error) {
    console.error('[admin/awards/winners GET] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ winners: data ?? [] });
}

// POST /api/admin/awards/winners
// Body: { category_id, year }
// Insert 1 row winner (kategori baru ditambahkan ke tahun tsb, broker_uuid NULL).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category_id, year } = body;

  if (!category_id || !year) {
    return NextResponse.json({ error: 'category_id and year required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('award_winners')
    .insert({ category_id, year, broker_uuid: null })
    .select()
    .single();

  if (error) {
    console.error('[admin/awards/winners POST] error:', error);
    // Kalau unique constraint kena (kategori udah ada di tahun itu), return 409
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Category already exists for this year' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ winner: data }, { status: 201 });
}
